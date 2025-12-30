import Teacher from '../models/Teacher.model.js';
import AvailabilityDB from '../models/AvailabilityDB.model.js';

/**
 * マッチング条件を計算
 */
const calculateMatching = (teacher, availabilities, conditions) => {
    const matched = {
        timeSlots: [],
        location: null,
        specialties: []
    };

    // 時間帯マッチング
    if (conditions.timeSlots && conditions.timeSlots.length > 0) {
        const teacherTimeSlots = availabilities.flatMap(a => a.timeSlots || []);
        matched.timeSlots = conditions.timeSlots.filter(slot =>
            teacherTimeSlots.includes(slot)
        );
    }

    // 地域マッチング
    if (conditions.cities && conditions.cities.includes(teacher.location)) {
        matched.location = teacher.location;
    }

    // 専門分野マッチング (常に表示)
    matched.specialties = teacher.specialties || [];

    return matched;
};

/**
 * マッチスコアを計算 (ソート用)
 */
const calculateMatchScore = (matchedConditions) => {
    let score = 0;
    score += (matchedConditions.timeSlots?.length || 0) * 3; // 時間帯は重要
    score += matchedConditions.location ? 2 : 0; // 地域も重要
    score += (matchedConditions.specialties?.length || 0) * 1; // 専門分野
    return score;
};

/**
 * 教師おすすめ一覧を取得
 * GET /api/teachers/recommendations
 */
export const getRecommendations = async (req, res) => {
    try {
        // クエリパラメータ取得
        const {
            timeSlots,
            cities,
            specialties,
            page = 1,
            limit = 6
        } = req.query;

        // 配列に変換
        const timeSlotsArray = timeSlots ? (Array.isArray(timeSlots) ? timeSlots : [timeSlots]) : [];
        const citiesArray = cities ? (Array.isArray(cities) ? cities : [cities]) : [];
        const specialtiesArray = specialties ? (Array.isArray(specialties) ? specialties : [specialties]) : [];

        // Step 1: Build availability query based on user's search criteria
        const availabilityQuery = {};

        if (timeSlotsArray.length > 0) {
            availabilityQuery.timeSlots = { $in: timeSlotsArray };
        }

        if (citiesArray.length > 0) {
            availabilityQuery.location = { $in: citiesArray };
        }

        console.log('[DEBUG] Availability Query:', JSON.stringify(availabilityQuery));

        // Step 2: Find matching availabilities
        const matchingAvailabilities = await AvailabilityDB.find(availabilityQuery).lean();
        console.log('[DEBUG] Found availabilities:', matchingAvailabilities.length);
        console.log('[DEBUG] Teacher IDs:', matchingAvailabilities.map(a => a.teacherId.toString()));

        // Step 3: Get unique teacher IDs (excluding current user)
        const currentUserId = req.user?.userId;
        console.log('[DEBUG] Current user ID:', currentUserId);

        const teacherIds = [...new Set(matchingAvailabilities.map(a => a.teacherId.toString()))]
            .filter(id => id !== currentUserId); // Don't recommend yourself

        console.log('[DEBUG] Unique teacher IDs after filtering:', teacherIds);

        if (teacherIds.length === 0) {
            // No matching teachers found
            return res.json({
                success: true,
                data: {
                    teachers: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        totalPages: 0
                    }
                }
            });
        }

        // Step 4: Build teacher query
        const teacherQuery = { userId: { $in: teacherIds } };

        // 専門分野フィルター (オプション)
        if (specialtiesArray.length > 0) {
            teacherQuery.specialties = { $in: specialtiesArray };
        }

        // Step 5: Get teacher profiles
        const teachers = await Teacher.find(teacherQuery)
            .populate('userId', 'email name')
            .lean();

        // Step 6: For each teacher, get their availabilities and calculate matching
        const teachersWithMatching = await Promise.all(
            teachers.map(async (teacher) => {
                // userId が存在しない場合はスキップ
                if (!teacher.userId || !teacher.userId._id) {
                    console.warn(`Teacher ${teacher._id} has no userId`);
                    return null;
                }

                // この教師の空き時間を取得
                const availabilities = await AvailabilityDB.find({
                    teacherId: teacher.userId._id
                }).lean();

                // マッチング条件計算
                const matched = calculateMatching(teacher, availabilities, {
                    timeSlots: timeSlotsArray,
                    cities: citiesArray,
                    specialties: specialtiesArray
                });

                // 時間帯を集約
                const allTimeSlots = availabilities.flatMap(a => a.timeSlots || []);
                const uniqueTimeSlots = [...new Set(allTimeSlots)];

                return {
                    id: teacher._id.toString(),
                    userId: teacher.userId._id.toString(), // User ID for matching requests
                    name: teacher.name,
                    workplace: teacher.workplace,
                    yearsOfExperience: teacher.yearsOfExperience,
                    subject: teacher.jobTitle || '教師',
                    profilePhoto: teacher.profilePhoto,
                    location: teacher.location,
                    availableTimeSlots: uniqueTimeSlots,
                    specialties: teacher.specialties || [],
                    matchedConditions: matched,
                    matchScore: calculateMatchScore(matched)
                };
            })
        );

        // null を除外
        let filteredTeachers = teachersWithMatching.filter(t => t !== null);

        // ソート (マッチスコア順)
        filteredTeachers.sort((a, b) => b.matchScore - a.matchScore);

        // スコアフィールドを削除
        filteredTeachers.forEach(t => delete t.matchScore);

        // ページネーション
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const paginatedTeachers = filteredTeachers.slice(skip, skip + limitNum);

        // レスポンス
        res.json({
            success: true,
            data: {
                teachers: paginatedTeachers,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: filteredTeachers.length,
                    totalPages: Math.ceil(filteredTeachers.length / limitNum)
                }
            }
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

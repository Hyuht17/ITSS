import Schedule from '../models/Schedule.model.js';
import ScheduleTemplate from '../models/ScheduleTemplate.model.js';

/**
 * Helper function to check for schedule conflicts
 */
const checkScheduleConflict = async (userId, startTime, endTime, excludeScheduleId = null) => {
    const query = {
        $and: [
            {
                $or: [
                    { createdBy: userId },
                    { participants: userId }
                ]
            },
            {
                status: { $ne: 'cancelled' }
            },
            {
                $or: [
                    // New schedule starts during existing schedule
                    {
                        startTime: { $lte: startTime },
                        endTime: { $gt: startTime }
                    },
                    // New schedule ends during existing schedule
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gte: endTime }
                    },
                    // New schedule completely contains existing schedule
                    {
                        startTime: { $gte: startTime },
                        endTime: { $lte: endTime }
                    }
                ]
            }
        ]
    };

    if (excludeScheduleId) {
        query._id = { $ne: excludeScheduleId };
    }

    const conflictingSchedule = await Schedule.findOne(query)
        .populate('participants', 'name email')
        .populate('createdBy', 'name email');

    return conflictingSchedule;
};

/**
 * @desc    Get schedules for a date range
 * @route   GET /api/schedules
 * @access  Private
 */
export const getSchedules = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        // Validate date parameters
        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: '開始日と終了日が必要です'
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: '無効な日付形式です'
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({
                success: false,
                message: '開始日は終了日より前である必要があります'
            });
        }

        // Find schedules where user is creator or participant
        const schedules = await Schedule.find({
            $and: [
                {
                    $or: [
                        { startTime: { $gte: startDate, $lte: endDate } },
                        { endTime: { $gte: startDate, $lte: endDate } },
                        {
                            $and: [
                                { startTime: { $lte: startDate } },
                                { endTime: { $gte: endDate } }
                            ]
                        }
                    ]
                },
                {
                    $or: [
                        { createdBy: req.user.userId },
                        { participants: req.user.userId }
                    ]
                }
            ]
        })
            .populate('participants', 'name email profilePhoto')
            .populate('createdBy', 'name email')
            .sort('startTime');

        res.json({
            success: true,
            count: schedules.length,
            data: schedules
        });

    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'スケジュールの取得に失敗しました',
            error: error.message
        });
    }
};

/**
 * @desc    Get schedule by ID
 * @route   GET /api/schedules/:id
 * @access  Private
 */
export const getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id)
            .populate('participants', 'name email profilePhoto')
            .populate('createdBy', 'name email');

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'スケジュールが見つかりません'
            });
        }

        // Check if user has access to this schedule
        const hasAccess = schedule.createdBy._id.toString() === req.user.userId ||
            schedule.participants.some(p => p._id.toString() === req.user.userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'このスケジュールにアクセスする権限がありません'
            });
        }

        res.json({
            success: true,
            data: schedule
        });

    } catch (error) {
        console.error('Get schedule by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'スケジュールの取得に失敗しました',
            error: error.message
        });
    }
};

/**
 * @desc    Create new schedule
 * @route   POST /api/schedules
 * @access  Private
 */
export const createSchedule = async (req, res) => {
    try {
        const { title, description, startTime, endTime, participants, matchingId, location, notes } = req.body;

        // Validate start/end time
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: '終了時間は開始時間より後である必要があります'
            });
        }

        // Check for conflicts
        const conflict = await checkScheduleConflict(req.user.userId, start, end);
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: 'スケジュールが重複しています',
                conflict: {
                    id: conflict._id,
                    title: conflict.title,
                    startTime: conflict.startTime,
                    endTime: conflict.endTime
                }
            });
        }

        // If participants are provided, check their conflicts too
        if (participants && participants.length > 0) {
            for (const participantId of participants) {
                const participantConflict = await checkScheduleConflict(participantId, start, end);
                if (participantConflict) {
                    return res.status(409).json({
                        success: false,
                        message: '相手のスケジュールが重複しています',
                        conflict: {
                            id: participantConflict._id,
                            title: participantConflict.title,
                            startTime: participantConflict.startTime,
                            endTime: participantConflict.endTime
                        }
                    });
                }
            }
        }

        const schedule = await Schedule.create({
            title,
            description,
            startTime: start,
            endTime: end,
            participants,
            matchingId,
            location,
            notes,
            createdBy: req.user.userId,
            status: 'confirmed'
        });

        await schedule.populate('participants', 'name email profilePhoto');

        res.status(201).json({
            success: true,
            data: schedule
        });

    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(400).json({
            success: false,
            message: 'スケジュールの作成に失敗しました',
            error: error.message
        });
    }
};

/**
 * @desc    Get schedule templates
 * @route   GET /api/schedules/templates
 * @access  Public
 */
export const getScheduleTemplates = async (req, res) => {
    try {
        const templates = await ScheduleTemplate.find({ isActive: true })
            .sort('order');

        res.json({
            success: true,
            count: templates.length,
            data: templates
        });

    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'テンプレートの取得に失敗しました',
            error: error.message
        });
    }
};

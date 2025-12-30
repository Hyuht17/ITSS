/**
 * Availability Model
 * 教師の空き時間と活動エリアを管理するモデル
 */

// 有効な時間帯
const VALID_TIME_SLOTS = ['morning', 'afternoon', 'evening'];

// 有効な都市
const VALID_LOCATIONS = ['ハノイ', 'ダナン', 'ニャチャン', 'カントー', 'ホーチミン市', 'ハイフォン'];

// ステータス
const STATUS = {
    AVAILABLE: 'available',  // 利用可能
    MATCHED: 'matched',      // マッチング済み
    COMPLETED: 'completed'   // 完了
};

/**
 * Availabilityデータの検証
 */
class Availability {
    /**
     * 日付が有効範囲内かチェック（現在から10日以内）
     * @param {string|Date} date - チェックする日付
     * @throws {Error} 無効な日付の場合
     */
    static validateDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 10);

        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        if (isNaN(dateObj.getTime())) {
            throw new Error('無効な日付形式です');
        }

        if (dateObj < today) {
            throw new Error('過去の日付は指定できません');
        }

        if (dateObj > maxDate) {
            throw new Error('日付は現在から10日以内である必要があります');
        }
    }

    /**
     * 時間帯が有効かチェック
     * @param {Array<string>} timeSlots - チェックする時間帯配列
     * @throws {Error} 無効な時間帯の場合
     */
    static validateTimeSlots(timeSlots) {
        if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
            throw new Error('時間帯を少なくとも1つ選択してください');
        }

        if (timeSlots.length > 2) {
            throw new Error('各日の時間帯は最大2枠までです');
        }

        // 重複チェック
        const uniqueSlots = new Set(timeSlots);
        if (uniqueSlots.size !== timeSlots.length) {
            throw new Error('時間帯が重複しています');
        }

        // 有効な値かチェック
        for (const slot of timeSlots) {
            if (!VALID_TIME_SLOTS.includes(slot)) {
                throw new Error(`無効な時間帯が含まれています: ${slot}`);
            }
        }
    }

    /**
     * 位置情報が有効かチェック
     * @param {string} location - チェックする位置情報
     * @throws {Error} 無効な位置情報の場合
     */
    static validateLocation(location) {
        if (!location || typeof location !== 'string') {
            throw new Error('位置情報は必須です');
        }

        if (!VALID_LOCATIONS.includes(location)) {
            throw new Error(`無効な位置情報です: ${location}`);
        }
    }

    /**
     * 登録日数が制限内かチェック（最大3日）
     * @param {Array} availabilities - チェックする空き時間配列
     * @throws {Error} 制限を超える場合
     */
    static validateDayLimit(availabilities) {
        if (!Array.isArray(availabilities)) {
            throw new Error('availabilitiesは配列である必要があります');
        }

        if (availabilities.length === 0) {
            throw new Error('少なくとも1日分の空き時間を登録してください');
        }

        if (availabilities.length > 3) {
            throw new Error('登録日数は最大3日までです');
        }

        // 日付の重複チェック
        const dates = availabilities.map(a => new Date(a.date).toISOString().split('T')[0]);
        const uniqueDates = new Set(dates);
        if (uniqueDates.size !== dates.length) {
            throw new Error('同じ日付が重複しています');
        }
    }

    /**
     * 単一のavailabilityデータを検証
     * @param {Object} availability - 検証するデータ
     * @throws {Error} バリデーションエラーの場合
     */
    static validateSingle(availability) {
        const { date, timeSlots, location } = availability;

        this.validateDate(date);
        this.validateTimeSlots(timeSlots);
        this.validateLocation(location);
    }

    /**
     * 複数のavailabilityデータを一括検証
     * @param {Array} availabilities - 検証するデータ配列
     * @throws {Error} バリデーションエラーの場合
     */
    static validateBatch(availabilities) {
        // 日数制限チェック
        this.validateDayLimit(availabilities);

        // 各データの検証
        availabilities.forEach((availability, index) => {
            try {
                this.validateSingle(availability);
            } catch (error) {
                throw new Error(`availabilities[${index}]: ${error.message}`);
            }
        });
    }
}

// エクスポート
export { Availability, VALID_TIME_SLOTS, VALID_LOCATIONS, STATUS };

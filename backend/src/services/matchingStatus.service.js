import Schedule from '../models/Schedule.model.js';
import MatchingRequest from '../models/MatchingRequest.model.js';

/**
 * Check and update finished matchings based on schedule end time
 * This function finds all approved matchings with schedules that have ended
 * and updates their status to 'finished'
 */
export const updateFinishedMatchings = async () => {
    try {
        const now = new Date();

        // Find all approved matchings
        const approvedMatchings = await MatchingRequest.find({ status: 'approved' });

        for (const matching of approvedMatchings) {
            // Find schedules for this matching that have ended
            const endedSchedules = await Schedule.find({
                matchingId: matching._id,
                endTime: { $lt: now }, // endTime is in the past
                status: { $ne: 'cancelled' } // not cancelled
            });

            // If there are ended schedules, mark matching as finished
            if (endedSchedules.length > 0) {
                matching.status = 'finished';
                await matching.save();
                console.log(`Matching ${matching._id} marked as finished`);
            }
        }

        return { success: true, message: 'Finished matchings updated' };
    } catch (error) {
        console.error('Error updating finished matchings:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get finished matchings for current user
 */
export const getFinishedMatchings = async (userId) => {
    try {
        const matchings = await MatchingRequest.find({
            $or: [
                { requesterId: userId },
                { receiverId: userId }
            ],
            status: 'finished'
        })
            .populate('requesterId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ updatedAt: -1 });

        return matchings;
    } catch (error) {
        console.error('Error getting finished matchings:', error);
        throw error;
    }
};

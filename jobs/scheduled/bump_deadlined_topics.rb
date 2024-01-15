# frozen_string_literal: true
module Jobs
    class BumpTopics < ::Jobs::Scheduled
        every 1.day

        def execute(args)
            category_ids = SiteSetting.deadline_allowed_on_categories.split('|').map(&:to_i)

            topics = Topic.where(category_id: category_ids).where(closed: false)
            topics = topics.select do |topic|
                topic.custom_fields['deadline_timestamp'].present?
            end

            topics = topics.sort_by do |topic|
            end
        end

        private

        def should_bump?(topic)
            topic.posts_count > 10
        end
    end
end
# frozen_string_literal: true

# name: discourse-topic-deadline
# about: Simple plugin to add a deadline to a topic
# version: 0.2.0
# authors: Pavel Mudroch
# url: https://github.com/pavelmudroch/discourse-topic-deadline

enabled_site_setting :deadline_enabled

register_asset 'stylesheets/deadline.scss'

after_initialize do
    Topic.register_custom_field_type('deadline_timestamp', :datetime)
    TopicList.preloaded_custom_fields << 'deadline_timestamp' if TopicList.respond_to? :preloaded_custom_fields

    DiscourseEvent.on(:topic_created) do |topic, params, _user|
      if params[:deadline_timestamp]
        topic.custom_fields['deadline_timestamp'] = params[:deadline_timestamp]
        topic.save
      end
    end

    register_topic_custom_field_type('deadline_timestamp', :datetime)

    add_to_serializer(:topic_view, :deadline_timestamp) do
      object.topic.custom_fields['deadline_timestamp']
    end

    add_to_serializer(:topic_list_item, :deadline_timestamp) do
      object.custom_fields['deadline_timestamp']
    end

    module ::DiscourseTopicDeadline
      class Engine < ::Rails::Engine
        engine_name 'discourse_topic_deadline'
        isolate_namespace DiscourseTopicDeadline
      end
    end

    DiscourseTopicDeadline::Engine.routes.draw do
      put '/topics/:id' => 'topics#update'
    end

    require_dependency "application_controller"

    class DiscourseTopicDeadline::TopicsController < ::ApplicationController

        def update
            topic = Topic.find(params[:id])

            unless guardian.can_edit?(topic)
                return render json: { error: 'You are not allowed to update this topic' }, status: 403
            end

            unless SiteSetting.deadline_allowed_on_categories.empty?
                allowed_category_ids = SiteSetting.deadline_allowed_on_categories.split('|').map(&:to_i)

                unless allowed_category_ids.include?(topic.category_id)
                    return render json: { error: 'Deadline plugin not enabled on this category'}, status: 500
                end
            end

            deadline_timestamp = params[:custom_fields][:deadline_timestamp]
            topic.custom_fields['deadline_timestamp'] = deadline_timestamp
            topic.save
            render json: success_json
        end
    end

    Discourse::Application.routes.append do
      mount ::DiscourseTopicDeadline::Engine, at: '/discourse-topic-deadline'
    end
end

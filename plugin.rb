# name: discourse-topic-deadline
# about: Simple plugin to add a deadline to a topic
# version: 0.1.0
# authors: Pavel Mudroch
# url: https://github.com/pavelmudroch/discourse-deadline-plugin

register_asset "stylesheets/deadline.scss"

after_initialize do
    Topic.register_custom_field_type('deadline_timestamp', :datetime)
    TopicList.preloaded_custom_fields << 'deadline_timestamp' if TopicList.respond_to? :preloaded_custom_fields

    DiscourseEvent.on(:topic_created) do |topic, params, user|
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
          engine_name "discourse_topic_deadline"
          isolate_namespace DiscourseTopicDeadline
        end
      end

    DiscourseTopicDeadline::Engine.routes.draw do
        put "/topics/:id" => "topics#update"
    end

    class DiscourseTopicDeadline::TopicsController < ::ApplicationController
        requires_plugin 'discourse-topic-deadline'

        def update
          topic = Topic.find(params[:id])
          deadline_timestamp = params[:custom_fields][:deadline_timestamp]
          topic.custom_fields['deadline_timestamp'] = deadline_timestamp
          topic.save
          render json: success_json
        end
      end

      Discourse::Application.routes.append do
        mount ::DiscourseTopicDeadline::Engine, at: "/discourse-topic-deadline"
      end

  end
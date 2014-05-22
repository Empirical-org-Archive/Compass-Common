module StudentProfileCache
  def invalidate_sync students
    Array.wrap(students).each do |student|
      ctrl_key = ActiveSupport::Cache.expand_cache_key('student-profile-vars-'+ student.id.to_s, :controller)
      view_key = ApplicationController.new.fragment_cache_key('student-profile-'+ student.id.to_s)

      begin
        Rails.cache.delete(ctrl_key)
        Rails.cache.delete(view_key)
      rescue Rest::HttpError
      end
    end
  end

  def invalidate *args
    QC.enqueue('StudentProfileCache.invalidate_sync', *args)
  end

  extend self
end

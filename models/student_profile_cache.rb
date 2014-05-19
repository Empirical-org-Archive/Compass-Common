module StudentProfileCache
  def invalidate students
    students.each do |student|
      ctrl_key = ActiveSupport::Cache.expand_cache_key('student-profile-vars-'+ student.id.to_s, :controller)
      view_key = ApplicationController.new.fragment_cache_key('student-profile-'+ student.id.to_s)

      Rails.cache.delete(ctrl_key)
      Rails.cache.delete(view_key)
    end
  end

  extend self
end

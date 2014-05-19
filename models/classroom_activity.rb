class ClassroomActivity < ActiveRecord::Base
  belongs_to :classroom
  belongs_to :activity
  belongs_to :unit
  has_one :topic, through: :activity
  has_many :activity_sessions, dependent: :destroy

  after_save do
    StudentProfileCache.invalidate(classroom.students)
  end

  def assigned_students
    User.where(id: assigned_student_ids)
  end

  def due_date_string= val
    self.due_date = Date.strptime(val, '%m/%d/%Y')
  end

  def due_date_string
    due_date.try(:strftime, '%m/%d/%Y')
  end

  def session_for user
    activity_sessions.find_or_create_by!(user_id: user.id)
  end

  def for_student? student
    return true if assigned_student_ids.nil? || assigned_student_ids.empty?
    assigned_student_ids.include?(student.id)
  end

  class << self
    # TODO: this method assumes that a student is only in ONE classroom.
    def create_session activity, options = {}
      classroom_activity = where(activity_id: activity.id, classroom_id: options[:user].classroom.id).first
      classroom_activity.activity_sessions.create!(user: options[:user])
    end
  end
end

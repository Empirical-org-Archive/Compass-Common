class ActivitySession < ActiveRecord::Base
  belongs_to :classroom_activity
  belongs_to :activity
  has_one :unit, through: :classroom_activity

  ownable :user

  before_create :create_uid
  before_create :set_state

  default_scope -> { order('activity_sessions.id desc') }

  def activity
    super || classroom_activity.activity
  end

  def classroom
    classroom_chapter.classroom
  end

  def percentage_color
    return '' unless completed?
    case percentage
    when 0.75..1.0
      'green'
    when 0.5..0.75
      'yellow'
    when 0.0..0.5
      'red'
    end
  end

  def activity_uid= uid
    self.activity_id = Activity.find_by_uid!(uid).id
  end

  def activity_uid
    activity.try(:uid)
  end

  def completed?
    completed_at.present?
  end

  # TODO
  # Quill main app no longer handles grading. Instead, services put grades
  # to quill. This was the original source:
  #
  # def grade
  #   return self[:grade] unless self[:grade].nil?
  #   return 1.0 if inputs.count == 0
  #   update_column :grade, inputs.map(&:score).inject(:+) / inputs.count
  #   self[:grade]
  # end
  #
  # For legacy reasons we will have it reference percentage:
  def grade
    percentage
  end

  alias owner user

  # TODO legacy fix
  def anonymous= anonymous
    self.temporary = anonymous
  end

  def anonymous
    temporary
  end

  def owned_by? user
    return true if temporary
    super
  end

protected

  def create_uid
    self.uid = SecureRandom.urlsafe_base64
  end

  def set_state
    self.state ||= 'unstarted'
  end
end

class ActivitySession < ActiveRecord::Base
  belongs_to :classroom_activity
  belongs_to :user
  belongs_to :activity#,   through: :classroom_activity
  has_many :inputs, class_name: 'RuleQuestionInput'

  serialize :story_step_input, Array
  serialize :missed_rules, Array

  before_create :create_uid
  before_create :set_state

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

protected

  def create_uid
    self.uid = SecureRandom.urlsafe_base64
  end

  def set_state
    self.state ||= 'unstarted'
  end
end

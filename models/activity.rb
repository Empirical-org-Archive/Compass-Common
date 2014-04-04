class Activity < ActiveRecord::Base
  include Flags

  belongs_to :classification, class_name: 'ActivityClassification', foreign_key: 'activity_classification_id'
  belongs_to :topic

  has_one :section, through: :topic
  has_one :workbook, through: :section

  has_many :classroom_activities, dependent: :destroy
  has_many :classrooms, through: :classroom_activities

  before_create :create_uid

  def classification_key= key
    self.classification = ActivityClassification.find_by_key(key)
  end

  def classification_key
    classification.try(:key)
  end

  def form_url
    url = classification.form_url.dup

    if Rails.env.development?
      url = ((u = URI.parse(url)).host = 'localhost'; u.to_s)
      url = ((u = URI.parse(url)).port = 3002; u.to_s)
    end

    url = UriParams.add_param(url, 'uid', uid) if uid.present?
    url
  end

  def module_url activity_session
    url = classification.module_url.dup

    # this forces the url to localhost:3002. At somp point this should be removed.
    if Rails.env.development?
      url = ((u = URI.parse(url)).host = 'localhost'; u.to_s)
      url = ((u = URI.parse(url)).port = 3002; u.to_s)
    end

    url = UriParams.add_param(url, 'uid', uid) if uid.present?

    url = if activity_session == :anonymous
      UriParams.add_param(url, 'anonymous', true)
    else
      UriParams.add_param(url, 'student', activity_session.uid) if uid.present?
    end

    url
  end

protected

  def create_uid
    self.uid = SecureRandom.urlsafe_base64
  end
end

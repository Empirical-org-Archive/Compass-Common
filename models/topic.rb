class Topic < ActiveRecord::Base
  belongs_to :section
  has_many :activities

  def section
    return NilSection if super.nil?
    super
  end
end

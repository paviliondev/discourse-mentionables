# frozen_string_literal: true

# All methods used to interact with external Google sheets
module ::MentionableItems::WorksheetsImport
  def self.import_sheets(worksheets)
    total_rows_imported = 0
    total_failures = 0
    worksheets.each do |sheet|
      results = import_sheet(sheet)
      total_rows_imported += results[:success_rows]
      total_failures += results[:failed_rows]
    end
    report = "Mentionable Items Import: Rows imported: #{total_rows_imported}, Failed rows: #{total_failures}"
    Rails.logger.info(report)
  end

  def self.import_sheet(sheet)
    number_of_successful_rows = 0
    number_of_failed_rows = 0
    sheet_meta = {
      "url": true,
      "image_url": true,
      "name": true,
      "description": true,
    }
    column = 1
    while column <= SiteSetting.mentionable_items_worksheet_max_column do
      if sheet_meta[sheet[1, column].downcase.to_sym]
        sheet_meta[sheet[1, column].downcase.to_sym] = column
      end
      column += 1
    end
    this_url, this_image_url, this_name, this_description = 0, 0, 0, 0 # cannot create variables dynamically in Ruby using eval
    row = 2
    while row <= SiteSetting.mentionable_items_worksheet_max_row do
      blank = true
      sheet_meta.each do |key|
        eval("this_#{key[0].to_s}=nil")
        if sheet_meta[key[0].to_sym] != true && !eval("this_#{key[0].to_s}=sheet[row, sheet_meta[key[0].to_sym]]").blank?
          blank = false
        end
      end
      if !blank
          successful_add = MentionableItem.add!(url: this_url, image_url: this_image_url, name: this_name, description: this_description)
          number_of_successful_rows += successful_add
          number_of_failed_rows += (successful_add.zero? ?  1 : 0)
      end
      row += 1
    end
    return {
      success_rows: number_of_successful_rows,
      failed_rows: number_of_failed_rows
    }
  end
end

# Copyright (c) 2024, Alon Ben Refael and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import cstr


class Sales(Document):
	pass

@frappe.whitelist()
def Create_Quotation(client, item_list, discount, h_p, q_num, objective, notes):
	import odfdo, json, os
	OUTPUT_DIR = os.getcwd() + '/' + cstr(frappe.local.site) + '/public/files/accounting/'
	item_dict = json.loads(item_list)
	from odfdo import (
		Cell,
		Frame,
		Document,
		Header,
		Paragraph,
		Row,
		Table,
		Style,
		create_table_cell_style,
	)
	def save_new(document: Document, name: str):
		new_path = OUTPUT_DIR + name
		document.save(new_path, pretty=True)
		os.system(f'/usr/bin/soffice --headless --convert-to pdf:writer_pdf_Export --outdir {OUTPUT_DIR} {new_path}')
	def populate_items(prod, val, quant, cost, row_number):
		row = Row()
		row.set_value("A", prod)
		cell = Cell()
		cell.set_value(val)
		cell.style = style_name
		row.set_cell("B", cell)
		row.set_value("C", quant)
		cell = Cell()
		cell.set_value(cost)
		cell.style = style_name
		row.set_cell(3, cell)
		row_number += 1
		table.set_row(row_number, row)
		return row_number
	def populate_totals(head, val, row_number):
		row = Row()
		row.set_value(column - 1, head)
		cell = Cell()
		cell.set_value(val)
		cell.style = style_name
		row.set_cell(column, cell)
		row_number += 1
		table.set_row(row_number, row)
		table.set_span((column - 3, row_number, column - 1, row_number), merge=True)
		return row_number
	document = Document("text")
	body = document.body
	document.delete_styles()
	STYLE_SOURCE = "/home/frappe/apps/template.odt"
	style_document = Document(STYLE_SOURCE)
	document.merge_styles_from(style_document)
	body = document.body
	body.append(style_document.get_formatted_text())
	title1 = Header(1, f"{objective}: {q_num} (מקור)")
	body.append(title1)
	title1 = Header(2, f"עבור: {client}")
	body.append(title1)
	title1 = Header(2, f"ע.מ/ת.ז: {h_p}")
	body.append(title1)
	body.append(Paragraph(""))
	body.append(Paragraph(""))
	table = Table("Table")
	body.append(table)
	row = Row()
	row.set_values(["מוצר", "מחיר", "כמות", "לתשלום"])
	table.set_row("A1", row)
	row_number = 0
	cell_style = create_table_cell_style(
		color="black",
		padding_right="1mm"
	)
	style_name = document.insert_style(style=cell_style, automatic=True)
	total = 0
	for prod in list(item_dict.keys()):
		price = item_dict[prod][1]
		quant = item_dict[prod][0]
		cost = price * quant
		row_number = populate_items(prod, f"{price:,.2f} ₪", str(quant), f"{cost:,.2f} ₪", row_number)
		total = total + cost
	cols = table.width
	column = cols - 1
	row = Row()
	row_number += 1
	table.set_row(row_number, row)
	table.set_span((0, row_number, 3, row_number))
	row_number = populate_totals('סה"כ',f"{total:,.2f}  ₪", row_number)
	discount = float(discount)
	if discount > 0 and discount < 1:
		discount = discount*100
		row_number = populate_totals('הנחה (%)',f"{discount:,.0f}", row_number)
		total = float(total) *(1 - discount/100)
		row_number = populate_totals('סה"כ אחרי הנחה',f"{total:,.2f}  ₪", row_number)
	elif discount > 1:
		row_number = populate_totals('הנחה',f"{discount:,.2f}  ₪", row_number)
		total = float(total) - discount
		row_number = populate_totals('סה"כ אחרי הנחה',f"{total:,.2f}  ₪", row_number)
	row_number = populate_totals('סה"כ פטור ממע"מ',f"{total:,.2f}  ₪", row_number)
	row_number = populate_totals('מע"מ', "0.00", row_number)
	if total*100%100 > 0:
		row_number = populate_totals('עיגול אגורות',f"{total:,.0f}  ₪", row_number)
	row_number = populate_totals('סה"כ לתשלום',f"{total:,.0f}  ₪", row_number)
	cell_style = create_table_cell_style(
		color="black",
		background_color=(210, 210, 210),
		padding_right="1mm"
	)
	style_name = document.insert_style(style=cell_style, automatic=True)
	row = table.get_row(0)
	for cell in row.traverse():
		cell.style = style_name
		row.set_cell(x=cell.x, cell=cell)
	table.set_row(row.y, row)
	widths = ["7cm","4cm","2cm","4cm"]
	i = 0
	for column in table.columns:
		col_style = Style("table-column" , width=widths[i])
		name = document.insert_style(style=col_style, automatic=True)
		i = i+1
		column.style = col_style
		table.set_column(column.x, column)
	uri = document.add_file(os.getcwd() + '/' + cstr(frappe.local.site) + '/public/files/sign.png')
	image_frame = Frame.image_frame(
		uri,
		size=("2.2cm", "1cm"),
		position=("6cm", "10cm"),
		anchor_type = "as-char",
	)
	if not notes == "":
		body.append(Paragraph(""))
		body.append(Paragraph('הערות:'))
		body.append(Paragraph(f"{notes}"))
	body.append(Paragraph(""))
	body.append(Paragraph(""))
	paragraph = Paragraph("", style="sign")
	paragraph.append_plain_text(frappe.db.get_single_value('Signature','signature'))
	body.append(paragraph)
	paragraph = Paragraph("", style="ltr")
	paragraph.append(image_frame)
	body.append(paragraph)
	save_new(document,q_num + '.odt')
	



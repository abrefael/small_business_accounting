src_fldr = '/home/frappe/frappe-bench/apps/small_business_accounting/apps'
dest_fldr = '/home/frappe/apps'
csv_file = '/asset_type_list.csv'

import frappe
import shutil, os, csv

def after_install():
	shutil.copytree(src_fldr, dest_fldr)
	print("Enter your name:")
	x = input()
	print("Hello, " + x)
	file = open(dest_fldr + csv_file,'r')
	reader = csv.reader(file, delimiter=',')
	for row in reader:
		doc = frappe.new_doc('Asset Type List')
		type = row[0]
		doc.name = type
		doc.asset_type = type
		doc.percent = float(row[1])
		doc.insert()


def after_migrate():
	import filecmp
	if not filecmp.cmp(src_fldr + csv_file, dest_fldr + csv_file):
		shutil.copyfileobj(src_fldr + csv_file, dest_fldr + csv_file)
		file = open(dest_fldr + csv_file,'r')
		reader = csv.reader(file, delimiter=',')
		for row in reader:
			type = row[0]
			percent = float(row[1])
			try:
				doc = frappe.get_doc('Asset Type List', type)
			except:
				doc = frappe.new_doc('Asset Type List')
				doc.name = type
				doc.asset_type = type
				doc.percent = percent
				doc.insert()
			else:
				if not percent == doc.percent:
					doc.percent = percent
					doc.save()

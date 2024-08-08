import frappe
def after_install():
	from os.path import exists
	flag = '/home/frappe/apps/Explanation'
	file_exists = exists(flag)
	if not file_exists:
		import shutil, os, csv
		shutil.copytree('/home/frappe/frappe-bench/apps/small_business_accounting/apps', '/home/frappe/apps')
		file = open('/home/frappe/apps/asset_type_list.csv','r')
		reader = csv.reader(file, delimiter=',')
		for row in reader:
			doc = frappe.new_doc('Asset Type List')
			type = row[0]
			doc.name = type
			doc.asset_type = type
			doc.percent = float(row[1])
			doc.insert()

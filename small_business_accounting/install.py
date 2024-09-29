src_fldr = '/home/frappe/frappe-bench/apps/small_business_accounting/apps'
dest_fldr = '/home/frappe/apps'
csv_file = '/asset_type_list.csv'

import frappe
import shutil, os, csv

def after_install():
	from getpass import getpass
	import subprocess
	#password = getpass('Please enter sudo password: ')
	os.system("cp -rf '" + src_fldr + "' '" + dest_fldr + "'")
	#subprocess.call('echo ' + password + ' | sudo -S apt install libreoffice-writer-nogui -y', shell=True)
	file = open(dest_fldr + csv_file,'r')
	reader = csv.reader(file, delimiter=',')
	for row in reader:
		doc = frappe.new_doc('Asset Type List')
		type = row[0]
		doc.name = type
		doc.asset_type = type
		doc.percent = float(row[1])
		doc.insert()
	print("אנא הכניסו חתימה להצעות מחיר, חשבוניות עסקה וקבלות. לסיום לחצו Ctrl-D:")
	contents = ["בברכה,","אלון בן רפאל"]
	while True:
		try:
			line = input()
		except EOFError:
			break
		contents.append(line)
	signature = '\n'.join(contents)
	print('עכשיו נרצה לדעת את ראשי התיבות של השם שלך (באנגלית):')
	line = input()
	frappe.db.set_single_value('Signature','signature',signature)
	frappe.db.set_single_value('Initials','initials',line)
	frappe.db.commit()



def after_migrate():
	import filecmp
	if not filecmp.cmp(src_fldr + csv_file, dest_fldr + csv_file):
		os.system("cp -rf '" + src_fldr + csv_file + "' '" + dest_fldr + csv_file + "'")
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

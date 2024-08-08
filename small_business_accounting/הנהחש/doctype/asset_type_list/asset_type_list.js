// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Item", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Asset Type List', {
	additional_information(frm) {
            const URL = 'https://mo.ralc.co.il/%D7%9E%D7%90%D7%9E%D7%A8-1115,1987-%D7%A9%D7%99%D7%A2%D7%95%D7%A8%D7%99-%D7%94%D7%A4%D7%97%D7%AA-%D7%94%D7%A9%D7%A0%D7%AA%D7%99-%D7%9C%D7%A4%D7%99-%D7%AA%D7%A7%D7%A0%D7%95%D7%AA-%D7%9E%D7%A1-%D7%94%D7%9B%D7%A0%D7%A1%D7%94-%D7%A4%D7%97%D7%AA-1941.aspx';
            window.open(URL, '_blank').focus();
	}
});

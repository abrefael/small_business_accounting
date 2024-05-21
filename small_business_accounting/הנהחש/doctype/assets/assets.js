// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Assets", {
// 	refresh(frm) {

// 	},
// });

    frappe.ui.form.on('Assets', {
	calculate(frm) {
		if ((!frm.doc.fiscal_year) || ((frm.doc.original_price == 0) && (frm.doc.canges_price == 0))){
            frappe.throw(__('יש לציין שנת כספים לחישוב וגם מחיר מקורי ו/או מחיר שינויים'));
            return;
		}
		if (frm.doc.total == 0){
		    frm.set_value ('total', frm.doc.original_price + frm.doc.canges_price);
		    frm.set_value ('loss_requested', frm.doc.total * frm.doc.rate_loss);
		    var prev_total_loss = frm.doc.prev_total_loss;
		    frm.set_value ('prev_total_loss', frm.doc.total_loss);
		    frm.set_value('total_loss', frm.doc.total_loss + prev_total_loss);
		    frm.set_value('current_value', frm.doc.total - frm.doc.total_loss);
		}
	}
});

// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Invoice", {
// 	refresh(frm) {

// 	},
// });small_business_accounting


frappe.ui.form.on('Invoice', {
	create_invoice(frm) {
	    var items = frm.doc.item_list;
	    var item_list='{';
	    var notes;
	    if (!frm.doc.notes){
	        notes='';
	    }
	    else{
	        notes = frm.doc.notes;
	    }
	    items.forEach((row)=> {
	        item_list = item_list+'"'+row.item+'":["'+row.desc+'",'+row.quant+','+row.price+'],';
	    });
	    item_list = item_list.substring(0, item_list.length - 1)+'}';
	    console.log(item_list);
	    var q_num = frm.doc.name;
        frappe.call({method:'small_business_accounting.%D7%94%D7%A0%D7%94%D7%97%D7%A9.doctype.invoice.invoice.Create_Invoice',
        args: {
        'client': frm.doc.client,
        'item_list': item_list,
        'discount': frm.doc.discount,
        'h_p': frm.doc.h_p,
        'q_num': q_num,
        'objective':"חשבונית עסקה מס'",
        'notes': notes
        }
        }).then(r => {
            window.open(`${window.location.origin}/files/accounting/${q_num}.pdf`, '_blank').focus();
        });
	}
});


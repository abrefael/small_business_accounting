// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Sales", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Sales', {
	quotation(frm) {
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
	        item_list = item_list+'"'+row.item+'":['+row.quant+','+row.price+'],';
	    });
	    item_list = item_list.substring(0, item_list.length - 1)+'}';
	    var q_num = frm.doc.name;
        frappe.call({method:'small_business_accounting.%D7%94%D7%A0%D7%94%D7%97%D7%A9.doctype.sales.sales.Create_Quotation',
        args: {
        'client': frm.doc.client,
        'item_list': item_list,
        'discount': frm.doc.discount,
        'h_p': frm.doc.h_p,
        'q_num': q_num,
        'objective':"הצעת מחיר מס'",
        'notes': notes
        }
        }).then(r => {
            window.open(`${window.location.origin}/files/accounting/${q_num}.pdf`, '_blank').focus();
        });
	}
});


frappe.ui.form.on('Sales', {
	invoice(frm) {
	    var items = frm.doc.item_list;
	    var item_list = [];
	    items.forEach((row)=> {
	        item_list.push({
	            'item' : row.item,
	            'quant' : row.quant,
	            'price' : row.price
	        }
	            );
	    });
	    frappe.db.insert({
            doctype: 'Invoice',
            client: frm.doc.client,
            item_list: item_list,
            discount: frm.doc.discount,
            h_p: frm.doc.h_p
        }).then(function(doc) {
            window.open(`${window.location.origin}/app/${doc.doctype.toLowerCase()}/${doc.name}`, '_blank').focus();
        });
	}
});

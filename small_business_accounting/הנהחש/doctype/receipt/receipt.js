// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Receipt", {
// 	refresh(frm) {

// 	},
// });small_business_accounting
frappe.ui.form.on('Receipt', {
	onload(frm) {
    if((!frm.doc.r_name)||(frm.doc.name.includes("new-receipt"))){
	frappe.db.count('Receipt')
    .then(count => {
        var name = 'YBR' + String(count+1).padStart(5, '0');
        frm.set_value('r_name', name);
        frm.set_value('caceled', 0);
    });
        }
	}
});




frappe.ui.form.on('Receipt', {
	load_lst(frm) {
	    if (frm.is_new()){
	        frm.save();
	    }
	    var inv_lst = frm.doc.inv_lst;
        var quot_lst = frm.doc.quot_lst;
        console.log(quot_lst.length);
        if (inv_lst.length == 0){
            if (quot_lst.length == 0){
                frappe.throw(__('קודם צריך לבחור הצעות מחיר ו/או חשבוניות עסקה'));
            }
            else {
                inv_lst = quot_lst;
            }
        }
        else if (quot_lst.length != 0){
            inv_lst = inv_lst.concat(quot_lst);
        }
        inv_lst.forEach((itm)=> {
    		frappe.call({method:'small_business_accounting.%D7%94%D7%A0%D7%94%D7%97%D7%A9.doctype.receipt.receipt.get_item_list',
                    args: {
                        "item": itm.inv
                    }
    	        }).then(r => {
    	                var itm_lst = r.message[0];
    	                var quant_lst = r.message[1];
    	                var i=0;
    	                var item;
    	                while (i<itm_lst.length){
    	                    item = frm.add_child("item_list");
    	                    item.item = itm_lst[i];
    	                    item.quant = quant_lst[i];
    	                    i++;
    			    refresh_field("item_list");
                        }
        console.log(r.message);
                    });
        });
	}
});


frappe.ui.form.on('Receipt', {
	creat_receipt(frm) {
	    if (frm.doc.caceled){
	        frappe.throw(__('זו קבלה מבוטלת! אין להפיקה מחדש! נא לשכפל את הקבלה מתפריט "..." ולהפיק קבלה חדשה.'));
	        return;
	    }
	    var items = frm.doc.item_list;
	    var item_list='{';
	    var notes;
	    var highest_sum = 0;
	    var price;
	    var q;
	    var sum;
	    var item;
	    if (!frm.doc.notes){
	        notes='';
	    }
	    else{
	        notes = frm.doc.notes;
	    }
	    items.forEach((row)=> {
	        price = row.price;
		q = row.quant;
		sum = price * q;
		item = row.item;
		if (sum > highest_sum){
		    frm.doc.most_impact = item;
		    refresh_field("most_impact");
		    highest_sum = sum;
		}
	        item_list = item_list+'"'+item+'":["'+row.desc+'",'+q+','+price+'],';
	    });
	    var discount = frm.doc.discount;
	    item_list = item_list.substring(0, item_list.length - 1)+'}';
	    console.log(item_list);
        frappe.call({method:'small_business_accounting.%D7%94%D7%A0%D7%94%D7%97%D7%A9.doctype.receipt.receipt.Create_Receipt',
        args: {
        'client': frm.doc.client,
        'item_list': item_list,
        'discount': discount,
        'h_p': frm.doc.h_p,
        'q_num': frm.doc.name,
        'objective':"קבלה מס'",
        'notes': notes
        }
        }).then(r => {
		frm.doc.total = Number(r.message);
		refresh_field("total");
            window.open(`${window.location.origin}/files/accounting/${q_num}.pdf`, '_blank').focus();
        });
	}
});



frappe.ui.form.on('Receipt', {
	cancel_r(frm) {
	    frm.set_value('caceled', 1);
	    frappe.db.delete_doc('Income', frm.doc.name);
        frappe.call({method:'small_business_accounting.%D7%94%D7%A0%D7%94%D7%97%D7%A9.doctype.receipt.receipt.cancel_receipt',
        args: {
        'q_num': frm.doc.name + '.pdf'
        }
        }).then(r => {
            frm.save();
            window.open(`${window.location.origin}/files/accounting/${q_num}`, '_blank').focus();
        });
	}
});


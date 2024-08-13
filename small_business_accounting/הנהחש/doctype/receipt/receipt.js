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

var total_discounts = '';
frappe.ui.form.on('Receipt', {
	load_lst(frm) {
		if (frm.is_new()){
			frm.save();
		}
		var inv_lst = frm.doc.inv_lst;
		var quot_lst = frm.doc.quot_lst;
		var invs_n_quots=[];
		var N = inv_lst.length;
		if (N > 0){ 
			for (let i = 0; i < N; i++){
				invs_n_quots.push(inv_lst[i].inv);
			}
		}
		N = quot_lst.length;
		if (N > 0){ 
			for (let i = 0; i < N; i++){
				invs_n_quots.push(quot_lst[i].quot);
			}
		}
		N = invs_n_quots.length
		if (N == 0){
			frappe.throw(__('קודם צריך לבחור הצעות מחיר ו/או חשבוניות עסקה'));
		}
		for (let i = 0; i < N; i++){
			let itm = invs_n_quots[i];
			let dtype;
			if (itm[0] == 'Q'){
				dtype = 'Sales';
			}
			else{
				dtype = 'Invoice';
			}
			total_discounts += 'שימו לב!\n';
			frappe.db.get_value(dtype, itm, ['sum', 'discounted_sum'])
				.then(r => {
					let sum = r.message.sum;
					let discounted_sum = r.message.discounted_sum;
					if (N == 1){
						console.log(sum - discounted_sum);
						frm.set_value('discount', sum - discounted_sum);
						frm.refresh_field('discount');
					}
					else{
					let q_v;
					if (dtype == 'Sales'){
						q_v = 'הצעת מחיר כוללת הנחה בסך: ';
					}
					else{
						q_v = 'חשבונית עסקה כוללת הנחה בסך: ';
					}
					total_discounts += q_v + (sum - discounted_sum) + 'ש"ח.\n'
					console.log(total_discounts);
					}
				});
			frappe.model.with_doc(dtype, itm, function () {
				let source_doc = frappe.model.get_doc(dtype, itm);
				let src_lst = source_doc.item_list;
				for (let i = 0; i < src_lst.length; i++){
					var addChild = frm.add_child("item_list");
					addChild.item = src_lst[i].item;
					addChild.quant = src_lst[i].quant;
					frm.refresh_field('item_list');
				}
			});
		}
		calculate_sum(frm);
	}
});

function calculate_sum(frm){
	var items = frm.doc.item_list;
	var sum = 0;
	var discounted_sum = 0;
	var discount = frm.doc.discount;
	for (let i = 0; i < items.length; i++){
		let row = items[i];
		let quant = row.quant;
		let price = row.price;
		sum += quant * price;
	}
	//frm.set_value('sum',sum);
	if (discount > 1){
		discounted_sum = sum - discount;
	}
	else {
		discounted_sum = sum * (1 - discount);
	}
	frm.set_value('total',discounted_sum);
	frm.save();
}

frappe.ui.form.on('Receipt', {
	discount(frm) {
		calculate_sum(frm);
	}
});



frappe.ui.form.on('Receipt', {
	creat_receipt(frm) {
	    if (frm.doc.caceled){
	        frappe.throw(__('זו קבלה מבוטלת! אין להפיקה מחדש! נא לשכפל את הקבלה מתפריט "..." ולהפיק קבלה חדשה.'));
	        return;
	    }
		if (total_discounts != ''){
			frappe.confirm(total_discounts + 'בטוחים שרוצים להמשיך?',
			() => {
				console.log('yes');
			}, () => {
				return;
			})
		}
	    var items = frm.doc.item_list;
	    var item_list='{';
	    var notes;
	    var highest_sum = 0;
	    if (!frm.doc.notes){
	        notes='';
	    }
	    else{
	        notes = frm.doc.notes;
	    }
	    for (let i = 0; i < items.length; i++){
			let row = items[i];
	        let price = row.price;
			let q = row.quant;
			let sum = price * q;
			let item = row.item;
			if (sum > highest_sum){
				frm.doc.most_impact = item;
				refresh_field("most_impact");
				highest_sum = sum;
			}
				item_list = item_list+'"'+item+'":["'+row.desc+'",'+q+','+price+'],';
	    }
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
            window.open(`${window.location.origin}/files/accounting/${q_num}.pdf`, '_blank').focus();
        });
	}
});


frappe.ui.form.on('Receipt', {
	validate: function(frm) {
        if(frm.doc.caceled) {
            frappe.throw(__('זו קבלה מבוטלת! אין להפיקה מחדש! נא לשכפל את הקבלה מתפריט "..." ולהפיק קבלה חדשה.'));
            validated = false;
        }
    }
});



frappe.ui.form.on('Receipt', {
	cancel_r(frm) {
	    frm.set_value('caceled', 1);
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

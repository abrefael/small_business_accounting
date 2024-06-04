// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Income Loss Report", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Income Loss Report', {
	calc(frm) {
	    function finale(){
			frm.set_value('profit_adj',frm.doc.profit_pre + frm.doc.car_non - frm.doc.car - frm.doc.insurance - frm.doc.office - frm.doc.subconturctors - frm.doc.asset_loss);
		    refresh_field('profit_adj');
	    }
		frm.save();
		var year = frm.doc.year;
		var rec_dict={};
		frappe.db.get_list('Receipt',{
			filters:{
				'receipt_date':['between', year+'-01-01', year+'-12-31'],
				'caceled':0
			},
			fields:['most_impact', 'total']
		}).then(records => {
			records.forEach((item) => {
				let itm = item.most_impact;
				if (itm in rec_dict){
					rec_dict[itm] = rec_dict[itm] + item.total;
				} else {
					rec_dict[itm] = item.total;
				}
				frm.set_value('profit_pre',frm.doc.profit_pre+item.total);
				refresh_field("profit_pre");
			});
			var row;
			for (const key of Object.keys(rec_dict)) {
				row = frm.add_child("items");
				row.item = key;
				row.sum = rec_dict[key];
				refresh_field("items");
			}
			finale();
		});
		frappe.db.get_list('Assets',{
			filters:{
				'fiscal_year':year
			},
			fields:['loss_requested']
		}).then(records => {
				records.forEach((item) => {
					frm.set_value('asset_loss',frm.doc.asset_loss+item.loss_requested);
					refresh_field("asset_loss");
				});
				finale();
			});
		frappe.db.get_list('Expenses',{
			filters:{
				'when':['between', year+'-01-01', year+'-12-31']
			},
			fields:['type', 'sum', 'actual_sum']
		}).then(records => {
            console.log(records);
			records.forEach((item) => {
				let actual_sum = item.actual_sum;
				let typ = item.type;
				let val = item.sum;
				if (typ == 'הוצאות רכב'){
					frm.set_value('car_non',frm.doc.car_non + val - actual_sum);
					refresh_field('car_non');
					frm.set_value('car',frm.doc.car + val);
					refresh_field('car');
				} else if (typ == 'ביטוח מקצועי והשתלמויות'){
					frm.set_value('insurance',frm.doc.insurance + actual_sum);
					refresh_field('insurance');
				} else if (typ == 'משרדיות ואחזקה'){
					frm.set_value('office',frm.doc.office + actual_sum);
					refresh_field('office');
				} else if (typ == 'קבלני משנה'){
					frm.set_value('subconturctors',frm.doc.subconturctors + actual_sum);
					refresh_field('subconturctors');
				}
			});
			finale();
		});
	}
});

// Copyright (c) 2024, Alon Ben Refael and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Income Loss Report", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on('Income Loss Report', {
	calc(frm) {
		var total_profit = 0;
		var asset_loss = 0;
		var losses = 0;
		var profit_pre;
		var profit_adj;
		var car_non = 0;
	    function finale(){
			frm.set_value('total_profit',total_profit);
			frm.set_value('asset_loss',asset_loss);
			refresh_field("total_profit");
			refresh_field("asset_loss");
			profit_pre = total_profit - losses - asset_loss;
			frm.set_value('profit_pre', profit_pre);
		    refresh_field("profit_pre");
			frm.set_value('car_non', car_non);
			refresh_field('car_non');
			profit_adj = profit_pre + car_non;
			frm.set_value('profit_adj', profit_adj);
		    refresh_field('profit_adj');
		    frm.save();
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
				total_profit = total_profit + item.total;
			});
			var row;
			for (const key of Object.keys(rec_dict)) {
				row = frm.add_child("items");
				row.item = key;
				row.sum = rec_dict[key];
				refresh_field("items");
			}
			frappe.db.get_list('Assets',{
				filters:{
					'fiscal_year':year
				},
				fields:['loss_requested']
			}).then(records => {
					records.forEach((item) => {
						asset_loss = asset_loss + item.loss_requested;
					});
					frappe.db.get_list('Expenses',{
						filters:{
							'when':['between', year+'-01-01', year+'-12-31']
						},
						fields:['type', 'sum', 'actual_sum']
					}).then(records => {
						records.forEach((item) => {
							let actual_sum = item.actual_sum;
							let typ = item.type;
							let val = item.sum;
							if (typ == 'הוצאות רכב'){
								car_non = car_non + val - actual_sum;
								frm.set_value('car',frm.doc.car + val);
								refresh_field('car');
								losses = losses + val;
							} else if (typ == 'ביטוח מקצועי והשתלמויות'){
								frm.set_value('insurance',frm.doc.insurance + actual_sum);
								refresh_field('insurance');
								losses = losses + actual_sum;
							} else if (typ == 'משרדיות ואחזקה'){
								frm.set_value('office',frm.doc.office + actual_sum);
								refresh_field('office');
								losses = losses + actual_sum;
							} else if (typ == 'קבלני משנה'){
								frm.set_value('subconturctors',frm.doc.subconturctors + actual_sum);
								refresh_field('subconturctors');
								losses = losses + actual_sum;
							}
						});
						finale();
					});
				});
		});
	}
});

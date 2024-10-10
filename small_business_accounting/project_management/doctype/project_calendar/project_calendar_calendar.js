
frappe.views.calendar["Project Calendar"] = {
	field_map: {
		start: "start",
		end: "start",
		id: "name",
		title: "name",
		allDay: "allDay"
	},
	get_events_method: "frappe.desk.calendar.get_events",
};

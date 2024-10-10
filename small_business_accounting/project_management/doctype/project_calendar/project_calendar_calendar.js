
frappe.views.calendar["Project Calendar"] = {
	field_map: {
		start: "start",
		end: "end",
		id: "name",
		title: "project",
		allDay: "allDay"
	},
	get_events_method: "frappe.desk.calendar.get_events",
};

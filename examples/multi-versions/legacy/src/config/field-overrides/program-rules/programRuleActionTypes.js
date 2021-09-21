const actionTypeFieldMapping = {
    DISPLAYTEXT: {
        label: 'display_text',
        required: ['location', 'content'],
        optional: ['data'],
        labelOverrides: {
            content: 'static_text',
            data: 'expression_to_evaluate_and_display_after_static_text',
        },
    },
    DISPLAYKEYVALUEPAIR: {
        label: 'display_key_value_pair',
        required: ['location', 'content'],
        optional: ['data'],
        labelOverrides: {
            content: 'key_label',
            data: 'expression_to_evaluate_and_display_as_value',
        },
    },
    HIDEFIELD: {
        label: 'hide_field',
        optional: ['dataElement', 'trackedEntityAttribute', 'content'],
        labelOverrides: {
            content: 'custom_message_for_blanked_field',
            dataElement: 'data_element_to_hide',
            trackedEntityAttribute: 'tracked_entity_attribute_to_hide',
        },
    },
    HIDESECTION: {
        label: 'hide_section',
        required: ['programStageSection'],
        labelOverrides: {
            programStageSection: 'program_stage_section_to_hide',
        },
    },
    HIDEPROGRAMSTAGE: {
        label: 'hide_program_stage',
        required: ['programStage'],
        labelOverrides: {
            programStage: 'program_stage_to_hide',
        },
    },
    HIDEOPTION: {
        label: 'hide_option',
        optional: ['dataElement', 'trackedEntityAttribute', 'option'],
        labelOverrides: {
            option: 'option_to_hide',
        }
    },
    HIDEOPTIONGROUP: {
        label: 'hide_option_group',
        optional: ['dataElement', 'trackedEntityAttribute', 'optionGroup'],
        labelOverrides: {
            optionGroup: 'option_group_to_hide',
        }
    },
    ASSIGN: {
        label: 'assign_value',
        required: ['data'],
        optional: ['dataElement', 'trackedEntityAttribute', 'content'],
        labelOverrides: {
            content: 'program_rule_variable_to_assign_to',
            dataElement: 'data_element_to_assign_to',
            trackedEntityAttribute: 'tracked_entity_attribute_to_assign_to',
            data: 'expression_to_evaluate_and_assign',
        },
    },
    SHOWWARNING: {
        label: 'show_warning',
        required: ['content'],
        optional: ['dataElement', 'trackedEntityAttribute', 'data'],
        labelOverrides: {
            content: 'static_text',
            dataElement: 'data_element_to_display_warning_next_to',
            trackedEntityAttribute: 'tracked_entity_attribute_to_display_warning_next_to',
            data: 'expression_to_evaluate_and_display_after_static_text',
        },
    },
    SHOWERROR: {
        label: 'show_error',
        required: ['content'],
        optional: ['dataElement', 'trackedEntityAttribute', 'data'],
        labelOverrides: {
            content: 'static_text',
            dataElement: 'data_element_to_display_error_next_to',
            trackedEntityAttribute: 'tracked_entity_attribute_to_display_error_next_to',
            data: 'expression_to_evaluate_and_display_after_static_text',
        },
    },
    WARNINGONCOMPLETE: {
        label: 'warning_on_complete',
        required: ['content'],
        optional: ['dataElement', 'trackedEntityAttribute', 'data'],
        labelOverrides: {
            content: 'static_text',
            dataElement: 'data_element_to_display_warning_next_to',
            trackedEntityAttribute: 'tracked_entity_attribute_to_display_warning_next_to',
            data: 'expression_to_evaluate_and_display_after_static_text',
        },
    },
    ERRORONCOMPLETE: {
        label: 'error_on_complete',
        required: ['content'],
        optional: ['dataElement', 'trackedEntityAttribute', 'data'],
        labelOverrides: {
            content: 'static_text',
            dataElement: 'data_element_to_display_error_next_to',
            trackedEntityAttribute: 'tracked_entity_attribute_to_display_error_next_to',
            data: 'expression_to_evaluate_and_display_after_static_text',
        },
    },
    CREATEEVENT: {
        label: 'create_event',
        required: ['programStage'],
        optional: ['data'],
    },
    SETMANDATORYFIELD: {
        label: 'set_field_to_be_mandatory',
        optional: ['dataElement', 'trackedEntityAttribute'],
        labelOverrides: {
            dataElement: 'data_element_to_make_mandatory',
            trackedEntityAttribute: 'tracked_entity_attribute_to_make_mandatory',
        },
    },
    SENDMESSAGE: {
        label: 'send_message',
        optional: ['templateUid'],
    },
    SCHEDULEMESSAGE: {
        label: 'schedule_message',
        required: ['templateUid', 'data'],
        labelOverrides: {
            data: 'date_to_send_message',
        }
    },
    SHOWOPTIONGROUP: {
        label: 'show_option_group',
        optional: ['dataElement', 'trackedEntityAttribute', 'optionGroup'],
        labelOverrides: {
            optionGroup: 'option_group_to_show',
        }
    }
};

export default actionTypeFieldMapping;

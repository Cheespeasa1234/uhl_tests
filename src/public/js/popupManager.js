'use strict';

/**
 * Initialize toastr and tippy.
 */
export function loadPopups() {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    
    tippy('[data-tippy-content]', {
        maxWidth: 350, // Max tooltip width
        interactive: true, // Lets user highlight and interact with the tooltip
        placement: "top", // Should make it appear above the element. doesn't work for some reason
        delay: [400, null], // Show delay is 200ms, hide delay is default
    });
}

/**
 * Show a toast to display an API result
 * @param {{ success: boolean, message: string, data: any }} json 
 */
export function showNotifToast(json) {
    const { success, message, data } = json;
    const DEBUG = false;
    if (DEBUG) {
        if (success) {
            toastr.success(JSON.stringify(data), message);
        } else {
            toastr.error(JSON.stringify(data), message);
        }
    } else {
        if (success) {
            console.log(json);
            toastr.success(message);
        } else {
            console.trace(json);
            toastr.error(message);
        }
    }
    
}
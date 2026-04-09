$(function() {

    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();
            var message = $("textarea#message").val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }

            // Disable button and show spinner
            var $btn = $('#contactForm button[type="submit"]');
            var originalText = $btn.html();
            var w = $btn.outerWidth();
            var h = $btn.outerHeight();
            $btn.css({ width: w, height: h })
                .html('<i class="fa-solid fa-spinner fa-spin"></i> Sending...')
                .prop('disabled', true);

            $.ajax({
                url: "https://script.google.com/macros/s/AKfycbwFQMM31pMpgWV5Yesz-FqL3NgPX5OS294CmJXnaqcYWJF-Rmi7ng_kXawKC5a94lPt/exec",
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    message: message
                },
                cache: false,
                success: function() {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Your message has been sent. </strong>");
                    $('#success > .alert-success')
                        .append('</div>');

                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                complete: function() {
                    // Always restore button after request finishes
                    $btn.html(originalText)
                        .prop('disabled', false)
                        .css({ width: '', height: '' });
                }
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });
});

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});

function removeSpaces(string) {
 return string.trim();
}

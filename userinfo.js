document.addEventListener("DOMContentLoaded", function() {
    var checkboxContainers = document.querySelectorAll('.checkbox-containeru');
    var nextLink = document.getElementById('next-link');

    checkboxContainers.forEach(function(container) {
        var checkbox = container.querySelector('input[type="checkbox"]');
        var label = container.querySelector('label');

        container.addEventListener('click', function(event) {
            if (event.target !== checkbox && event.target !== label) {
                checkbox.click();
            }
        });

        checkbox.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    nextLink.addEventListener('click', function(event) {
        var inputBox1 = document.getElementById('input-box-1').value.trim();
        var inputBox2 = document.getElementById('input-box-2').value.trim();
        var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        var interests = Array.from(checkboxes).map(checkbox => checkbox.value);

        if (inputBox1.length === 0 || inputBox2.length === 0 || interests.length === 0) {
            event.preventDefault();
            alert("Please ensure that you have entered both your first and last name, and selected at least one interest before proceeding.");
        } else {
            // Create user info object
            var userInfo = {
                firstName: inputBox1,
                lastName: inputBox2,
                interests: interests
            };

            // Send data to server
            fetch('/saveUserInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userInfo)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Optionally redirect or take other actions after successful submission
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
});

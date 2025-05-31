document.addEventListener('DOMContentLoaded', function() {
    // Removed old order button listener and variable declaration
    // const orderButton = document.getElementById('orderButton');
    // const orderFormSection = document.getElementById('orderFormSection');

    // if (orderButton && orderFormSection) {
    //     orderButton.addEventListener('click', function() {
    //         orderFormSection.scrollIntoView({
    //             behavior: 'smooth'
    //         });
    //     });
    // }

    // Add event listeners for scrolling to the order form section
    const scrollButtons = document.querySelectorAll('.shop-button, .order-button');
    const orderFormSection = document.getElementById('orderFormSection');

    if (orderFormSection) {
        scrollButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior if any
                orderFormSection.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    // Add event listener for scrolling to the countdown section
    const navButton = document.querySelector('.nav-button');
    const countdownSection = document.querySelector('.countdown-section');

    if (navButton && countdownSection) {
        navButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior if any
            countdownSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Future: Add form submission handling here
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            // Collect form data
            const formData = new FormData(orderForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            console.log('Form Data:', data);

            // Here you would typically send the data to your backend
            // using fetch() or XMLHttpRequest.
            // Example (requires backend endpoint):
            /*
            fetch('/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Display a success message or redirect
            })
            .catch((error) => {
                console.error('Error:', error);
                // Display an error message
            });
            */

            // For now, just show an alert
            alert('Thông tin đã được gửi đi (kiểm tra console để xem dữ liệu).');
        });

        // --- Dropdown dependencies handling --- 
        const provinceSelect = orderForm.querySelector('select[name="province"]');
        const districtSelect = orderForm.querySelector('select[name="district"]');
        const wardSelect = orderForm.querySelector('select[name="ward"]');

        // Function to clear dropdown options
        function clearDropdown(dropdown, defaultText) {
            dropdown.innerHTML = '<option value="">Chọn ' + defaultText + '</option>';
            dropdown.disabled = true; // Disable until options are loaded or selected
        }

        // Function to populate provinces dropdown
        async function populateProvinces() {
            const apiUrl = 'https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1';
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                // Check if the response structure is as expected and data.data is an array
                if (data && data.exitcode === 1 && Array.isArray(data.data.data)) {
                     clearDropdown(provinceSelect, 'Tỉnh/Thành phố'); // Clear before populating
                     provinceSelect.disabled = false; // Enable before populating
                    data.data.data.forEach(province => { // Access the nested data array
                        const option = document.createElement('option');
                        option.value = province.code;
                        option.textContent = province.name;
                        provinceSelect.appendChild(option);
                    });
                } else {
                     console.error('Failed to load provinces or unexpected data structure:', data);
                     clearDropdown(provinceSelect, 'Tỉnh/Thành phố');
                }
            } catch (error) {
                console.error('Error fetching provinces:', error);
                clearDropdown(provinceSelect, 'Tỉnh/Thành phố');
            }
        }

        // Function to populate districts dropdown
        async function populateDistricts(provinceCode) {
            const apiUrl = `https://vn-public-apis.fpo.vn/districts/getByProvince/?provinceCode=${provinceCode}&limit=-1`;
             try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                 clearDropdown(districtSelect, 'Quận/Huyện'); // Clear before populating
                 clearDropdown(wardSelect, 'Phường/Xã'); // Clear ward dropdown when district changes
                 
                 // More robust check for nested data array
                 if (data && data.exitcode === 1 && data.data && Array.isArray(data.data.data)) {
                     districtSelect.disabled = false; // Enable before populating
                    data.data.data.forEach(district => {
                        const option = document.createElement('option');
                        option.value = district.code;
                        option.textContent = district.name;
                        districtSelect.appendChild(option);
                    });
                 } else {
                     console.error('Failed to load districts or unexpected data structure:', data);
                     clearDropdown(districtSelect, 'Quận/Huyện');
                 }
            } catch (error) {
                console.error('Error fetching districts:', error);
                 clearDropdown(districtSelect, 'Quận/Huyện');
            }
        }

         // Function to populate wards dropdown
        async function populateWards(districtCode) {
            const apiUrl = `https://vn-public-apis.fpo.vn/wards/getByDistrict/?districtCode=${districtCode}&limit=-1`;
             try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                 clearDropdown(wardSelect, 'Phường/Xã'); // Clear before populating
                 
                 // More robust check for nested data array
                 if (data && data.exitcode === 1 && data.data && Array.isArray(data.data.data)) {
                     wardSelect.disabled = false; // Enable before populating
                    data.data.data.forEach(ward => {
                        const option = document.createElement('option');
                        option.value = ward.code;
                        option.textContent = ward.name;
                        wardSelect.appendChild(option);
                    });
                 } else {
                     console.error('Failed to load wards or unexpected data structure:', data);
                     clearDropdown(wardSelect, 'Phường/Xã');
                 }
            } catch (error) {
                console.error('Error fetching wards:', error);
                 clearDropdown(wardSelect, 'Phường/Xã');
            }
        }


        // Initial state: disable district and ward dropdowns and populate provinces
        clearDropdown(provinceSelect, 'Tỉnh/Thành phố');
        clearDropdown(districtSelect, 'Quận/Huyện');
        clearDropdown(wardSelect, 'Phường/Xã');

        // Populate provinces on load
        populateProvinces();

        // Event listener for province dropdown change
        provinceSelect.addEventListener('change', function() {
            const selectedProvinceCode = this.value;

            // Clear and disable dependent dropdowns
            clearDropdown(districtSelect, 'Quận/Huyện');
            clearDropdown(wardSelect, 'Phường/Xã');

            if (selectedProvinceCode) {
                populateDistricts(selectedProvinceCode);
            }
        });

        // Event listener for district dropdown change
        districtSelect.addEventListener('change', function() {
            const selectedDistrictCode = this.value;

            // Clear and disable ward dropdown
            clearDropdown(wardSelect, 'Phường/Xã');

            if (selectedDistrictCode) {
                 populateWards(selectedDistrictCode);
            }
        });
         // --- End Dropdown dependencies handling --- 
    }
}); 

const deadline = new Date();
    deadline.setDate(deadline.getDate() + 1); // +1 ngày tính từ bây giờ

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = deadline.getTime() - now;

        if (distance <= 0) {
            document.getElementById("countdown").innerHTML = "<b>Hết thời gian khuyến mãi</b>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = days.toString().padStart(2, '0');
        document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
    }

    // Gọi hàm mỗi giây
    setInterval(updateCountdown, 1000);
    updateCountdown(); // gọi lần đầu tiên để hiển thị ngay

    //Gửi đơn tới Google Sheet PickleBall
    // document.getElementById('orderForm').addEventListener('submit', function (e) {
    //     e.preventDefault();
      
    //     const form = this;
      
    //     // Xóa thông báo cũ
    //     form.querySelectorAll('.form-message').forEach(el => el.remove());
      
    //     // Hiển thị loading
    //     const loading = document.createElement('div');
    //     loading.className = 'form-message';
    //     loading.innerText = "Đang gửi đơn hàng...";
    //     loading.style.cssText = `
    //       padding: 10px;
    //       background: #fff3cd;
    //       border: 1px solid #ffeeba;
    //       color: #856404;
    //       font-weight: bold;
    //       text-align: center;
    //       margin-bottom: 10px;
    //     `;
    //     form.prepend(loading);
      
    //     // Lấy text từ select
    //     const province = form.province.options[form.province.selectedIndex].text;
    //     const district = form.district.options[form.district.selectedIndex].text;
    //     const ward = form.ward.options[form.ward.selectedIndex].text;
      
    //     const formData = new FormData();
    //     formData.append("name", form.name.value);
    //     formData.append("phone", form.phone.value);
    //     formData.append("address", form.address.value);
    //     formData.append("province", province);
    //     formData.append("district", district);
    //     formData.append("ward", ward);
    //     formData.append("detailed_address", form.detailed_address.value);
    //     formData.append("quantity", form.quantity.value);
      
    //     // Gửi không cần chờ phản hồi
    //     fetch("https://script.google.com/macros/s/AKfycbwlZbcTRe-WSWBUnAl1iyKm3kVRvjnrJcyw3K660cooltHmWi-3zXHbrvNbvWp1LkkA0w/exec", {
    //       method: 'POST',
    //       body: formData
    //     });
      
    //     // Hiển thị cảm ơn sau khi gửi
    //     loading.remove();
    //     const successMsg = document.createElement('div');
    //     successMsg.className = 'form-message';
    //     successMsg.innerText = "✅ Cảm ơn bạn đã đặt hàng!";
    //     successMsg.style.cssText = `
    //       padding: 10px;
    //       background: #d4edda;
    //       border: 1px solid #c3e6cb;
    //       color: #155724;
    //       font-weight: bold;
    //       text-align: center;
    //       margin-bottom: 10px;
    //     `;
    //     form.prepend(successMsg);
    //     setTimeout(() => successMsg.remove(), 5000);
    //     form.reset();
    //   });

      document.getElementById('orderForm').addEventListener('submit', function (e) {
        e.preventDefault();
      
        const form = this;
      
        // Xóa các popup cũ nếu có
        const oldPopup = document.querySelector('.thank-you-popup');
        if (oldPopup) oldPopup.remove();
      
        // Lấy dữ liệu từ select
        const province = form.province.options[form.province.selectedIndex].text;
        const district = form.district.options[form.district.selectedIndex].text;
        const ward = form.ward.options[form.ward.selectedIndex].text;
      
        const formData = new FormData();
        formData.append("name", form.name.value);
        formData.append("phone", form.phone.value);
        formData.append("address", form.address.value);
        formData.append("province", province);
        formData.append("district", district);
        formData.append("ward", ward);
        formData.append("detailed_address", form.detailed_address.value);
        formData.append("quantity", form.quantity.value);
      
        // Gửi dữ liệu mà không chờ phản hồi
        fetch("https://script.google.com/macros/s/AKfycbwlZbcTRe-WSWBUnAl1iyKm3kVRvjnrJcyw3K660cooltHmWi-3zXHbrvNbvWp1LkkA0w/exec", {
          method: 'POST',
          body: formData
        });
      
        // Hiển thị popup cảm ơn
        const popup = document.createElement('div');
        popup.className = 'thank-you-popup';
        popup.innerHTML = `
          <div class="popup-content">
            <button class="close-popup">✖</button>
            <h3>✅ Cảm ơn bạn đã đặt hàng!</h3>
            <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
          </div>
        `;
        document.body.appendChild(popup);
      
        // Xử lý nút đóng
        popup.querySelector('.close-popup').addEventListener('click', () => popup.remove());
      
        // Tự động đóng sau 5 giây
        setTimeout(() => popup.remove(), 5000);
      
        form.reset();
      });
      
      
      
      
      
      
      
      
      
      
      
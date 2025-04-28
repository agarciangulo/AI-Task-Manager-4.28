// Updated JavaScript for Task Manager

$(document).ready(function() {
    // Form submission handler with enhanced UX
    $('#updateForm').on('submit', function(e) {
        e.preventDefault();
        
        const updateText = $('#updateText').val().trim();
        if (!updateText) {
            showNotification('Please enter your update text', 'warning');
            return;
        }
        
        // Show loading indicator and disable button
        $('#submitBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');
        $('#loadingIndicator').fadeIn(300);
        
        // Placeholder loading text
        $('#results').html(`
            <div class="text-center p-4">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p class="text-muted">Analyzing your update...</p>
                <p class="text-muted small">Extracting tasks and generating insights</p>
            </div>
        `);
        
        // Send AJAX request
        $.ajax({
            url: '/api/process_update',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                update_text: updateText
            }),
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    displayResults(response);
                    showNotification('Update processed successfully!', 'success');
                } else {
                    $('#results').html(`
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Error:</strong> ${response.message}
                        </div>
                    `);
                    showNotification('Error processing update', 'danger');
                }
            },
            error: function(xhr, status, error) {
                $('#results').html(`
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Error:</strong> Could not process your update. Please try again later.
                    </div>
                `);
                showNotification('Server error. Please try again.', 'danger');
                console.error('Error:', error);
            },
            complete: function() {
                // Hide loading indicator and restore button
                $('#submitBtn').prop('disabled', false).html('<i class="bi bi-send"></i> Submit Update');
                $('#loadingIndicator').fadeOut(300);
                
                // Refresh categories dropdown
                refreshCategories();
                
                // Collapse tools section if it was hidden
                if (!$('#toolsCollapse').hasClass('show')) {
                    $('#toolsCollapse').collapse('show');
                }
                
                // Scroll to results on mobile
                if (window.innerWidth < 992) {
                    $('html, body').animate({
                        scrollTop: $('#results').offset().top - 20
                    }, 500);
                }
            }
        });
    });
    
    // Check for overdue tasks with enhanced UX
    $('#reminderBtn').on('click', function() {
        const $btn = $(this);
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Checking...');
        
        $('#reminderOutput').html(`
            <div class="text-center p-3">
                <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
                <p class="text-muted small">Checking for overdue tasks...</p>
            </div>
        `);
        
        $.ajax({
            url: '/api/stale_tasks',
            type: 'GET',
            success: function(response) {
                if (response.success) {
                    if (response.has_stale) {
                        displayStaleTasks(response.tasks_by_employee);
                        showNotification('Found overdue tasks that need attention', 'warning');
                    } else {
                        $('#reminderOutput').html(`
                            <div class="alert alert-success">
                                <i class="bi bi-check-circle-fill me-2"></i>
                                ${response.message}
                            </div>
                        `);
                        showNotification('No overdue tasks found!', 'success');
                    }
                } else {
                    $('#reminderOutput').html(`
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${response.message}
                        </div>
                    `);
                    showNotification('Error checking overdue tasks', 'danger');
                }
            },
            error: function(xhr, status, error) {
                $('#reminderOutput').html(`
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Error:</strong> Could not fetch overdue tasks. Please try again later.
                    </div>
                `);
                showNotification('Server error. Please try again.', 'danger');
                console.error('Error:', error);
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i class="bi bi-search"></i> Check Overdue Tasks');
            }
        });
    });
    
    // View tasks by category with enhanced UX
    $('#categoryBtn').on('click', function() {
        const category = $('#categoryDropdown').val();
        if (!category) {
            showNotification('Please select a category', 'warning');
            return;
        }
        
        const $btn = $(this);
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        
        $('#categoryResult').html(`
            <div class="text-center p-3">
                <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                <p class="text-muted small">Fetching tasks for ${category}...</p>
            </div>
        `);
        
        $.ajax({
            url: `/api/tasks_by_category?category=${encodeURIComponent(category)}`,
            type: 'GET',
            success: function(response) {
                if (response.success) {
                    if (response.has_tasks) {
                        displayCategoryTasks(response, category);
                        showNotification(`Loaded ${category} tasks successfully`, 'success');
                    } else {
                        $('#categoryResult').html(`
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                ${response.message}
                            </div>
                        `);
                        showNotification('No open tasks found', 'info');
                    }
                } else {
                    $('#categoryResult').html(`
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${response.message}
                        </div>
                    `);
                    showNotification('Error fetching tasks', 'danger');
                }
            },
            error: function(xhr, status, error) {
                $('#categoryResult').html(`
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Error:</strong> Could not fetch tasks. Please try again later.
                    </div>
                `);
                showNotification('Server error. Please try again.', 'danger');
                console.error('Error:', error);
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i class="bi bi-filter"></i> View Tasks by Project');
            }
        });
    });
    
    // Function to refresh categories
    function refreshCategories() {
        $.ajax({
            url: '/api/categories',
            type: 'GET',
            success: function(response) {
                if (response.success) {
                    const dropdown = $('#categoryDropdown');
                    dropdown.empty();
                    
                    response.categories.forEach(function(category) {
                        dropdown.append(`<option value="${category}">${category}</option>`);
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error refreshing categories:', error);
            }
        });
    }
    
    // Function to display task processing results
    function displayResults(response) {
        let html = '';
        
        // Display extracted tasks
        if (response.tasks && response.tasks.length > 0) {
            html += `
                <div class="mb-4">
                    <h6 class="mb-3">
                        <i class="bi bi-list-check text-primary me-2"></i>
                        Extracted Tasks (${response.tasks.length})
                    </h6>
                    <ul class="task-list">
            `;
            
            response.tasks.forEach(function(task) {
                const statusClass = getStatusClass(task.status);
                html += `
                    <li class="task-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                ${task.task}
                                <span class="task-status ${statusClass}">${task.status}</span>
                            </div>
                            <small class="text-muted ms-2">${task.category}</small>
                        </div>
                        <div class="mt-1">
                            <small class="text-muted">Assigned to: ${task.employee}</small>
                        </div>
                    </li>
                `;
            });
            
            html += `
                    </ul>
                    <div class="alert alert-success mt-3">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        ${response.tasks.length} tasks synced to Notion.
                    </div>
                </div>
            `;
        }
        
        // Display coaching insights
        if (response.coaching) {
            html += `
                <div class="insights-section">
                    <h6 class="mb-3">
                        <i class="bi bi-lightbulb text-warning me-2"></i>
                        AI Assessment
                    </h6>
                    <p>${response.coaching}</p>
                </div>
            `;
        }
        
        // Display logs if in debug mode
        if (response.logs && response.logs.length > 0) {
            html += `
                <details class="mt-3">
                    <summary class="text-muted small">Technical Details</summary>
                    <div class="tech-details">
                        ${response.logs.join('<br>')}
                    </div>
                </details>
            `;
        }
        
        $('#results').html(html);
    }
    
    // Function to display stale tasks
    function displayStaleTasks(tasksByEmployee) {
        let html = `
            <h6 class="mb-3">
                <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                Overdue Tasks
            </h6>
        `;
        
        for (const employee in tasksByEmployee) {
            html += `
                <div class="employee-section">
                    <div class="employee-name">
                        <i class="bi bi-person-fill me-1"></i>
                        ${employee}
                    </div>
                    <ul class="task-list">
            `;
            
            tasksByEmployee[employee].forEach(function(task) {
                const statusClass = getStatusClass(task.status);
                html += `
                    <li class="task-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                ${task.task}
                                <span class="task-status ${statusClass}">${task.status}</span>
                            </div>
                        </div>
                        <div class="mt-1 d-flex justify-content-between">
                            <small class="text-muted">Since: ${task.date}</small>
                            <small class="text-danger fw-bold">${task.days_old} days overdue</small>
                        </div>
                    </li>
                `;
            });
            
            html += `
                    </ul>
                </div>
            `;
        }
        
        $('#reminderOutput').html(html);
    }
    
    // Function to display category tasks
    function displayCategoryTasks(response, category) {
        let html = `
            <h6 class="mb-3">
                <i class="bi bi-folder-fill text-primary me-2"></i>
                Tasks for "${category}"
            </h6>
        `;
        
        // Display tasks by employee
        const tasksByEmployee = response.tasks_by_employee;
        for (const employee in tasksByEmployee) {
            html += `
                <div class="employee-section">
                    <div class="employee-name">
                        <i class="bi bi-person-fill me-1"></i>
                        ${employee}
                    </div>
                    <ul class="task-list">
            `;
            
            tasksByEmployee[employee].forEach(function(task) {
                const statusClass = getStatusClass(task.status);
                html += `
                    <li class="task-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                ${task.task}
                                <span class="task-status ${statusClass}">${task.status}</span>
                            </div>
                        </div>
                        <div class="mt-1">
                            <small class="text-muted">Date: ${task.date}</small>
                        </div>
                    </li>
                `;
            });
            
            html += `
                    </ul>
                </div>
            `;
        }
        
        // Display status summary
        if (response.status_summary) {
            html += `<div class="mt-3">
                <h6 class="mb-2">
                    <i class="bi bi-bar-chart-fill text-primary me-2"></i>
                    Project Status Summary
                </h6>
                <div class="d-flex flex-wrap gap-2 mb-3">
            `;
            
            for (const status in response.status_summary) {
                const statusClass = getStatusClass(status);
                html += `
                    <div class="badge bg-light text-dark p-2">
                        <span class="task-status ${statusClass} me-1">${status}</span>
                        <span class="fw-bold">${response.status_summary[status]}</span> task(s)
                    </div>
                `;
            }
            
            html += `
                </div>
            </div>`;
        }
        
        // Display AI insight
        if (response.insight) {
            html += `
                <div class="insights-section mt-3">
                    <h6 class="mb-2">
                        <i class="bi bi-lightbulb text-warning me-2"></i>
                        AI Project Insight
                    </h6>
                    <p>${response.insight}</p>
                </div>
            `;
        }
        
        $('#categoryResult').html(html);
    }
    
    // Helper function to get status class
    function getStatusClass(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('completed')) {
            return 'status-completed';
        } else if (statusLower.includes('progress')) {
            return 'status-in-progress';
        } else if (statusLower.includes('pending')) {
            return 'status-pending';
        } else if (statusLower.includes('blocked')) {
            return 'status-blocked';
        } else {
            return '';
        }
    }
    
    // Function to show toast notifications
    function showNotification(message, type = 'info') {
        // Remove existing toasts
        $('.toast').remove();
        
        // Create new toast
        const toast = `
            <div class="toast position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${type} text-white">
                    <strong class="me-auto">Task Manager</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        // Append and show toast
        $('body').append(toast);
        $('.toast').toast({
            delay: 3000,
            animation: true
        }).toast('show');
    }
    
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Create a favicon dynamically
    if (!$('link[rel="icon"]').length) {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>';
        document.head.appendChild(favicon);
    }
});
// Room Management Admin Dashboard - CRUD Operations

const API_BASE = '/api/rooms';

// Fetch and display rooms
async function fetchRooms() {
    const minCapacity = document.getElementById('filterCapacity').value;
    const tableBody = document.getElementById('tableBody');
    
    try {
        const response = await fetch(`${API_BASE}?minCapacity=${minCapacity}`);
        const rooms = await response.json();
        
        if (rooms.length === 0) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No rooms found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = rooms.map(room => `
            <tr>
                <td>
                    ${room.imageUrl 
                        ? `<img src="${room.imageUrl}" alt="${room.hallName}" onerror="this.style.display='none'">` 
                        : '<span style="color:var(--ivory-dim);font-size:12px">No image</span>'}
                </td>
                <td>${room.venueId}</td>
                <td><strong>${room.hallName}</strong></td>
                <td>${room.capacity}</td>
                <td>${room.description || '-'}</td>
                <td>
                    <span style="padding:4px 10px;border-radius:12px;font-size:11px;background:${room.active ? 'var(--brass-bright)' : '#666'};color:${room.active ? 'var(--bg)' : 'var(--ivory-dim)'}">
                        ${room.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button onclick="editRoom(${room.venueId})" style="padding:6px 12px;margin-right:4px;border:1px solid var(--border);background:var(--surface-alt);color:var(--ivory);border-radius:4px;cursor:pointer">Edit</button>
                    <button onclick="toggleStatus(${room.venueId}, ${room.active})" style="padding:6px 12px;margin-right:4px;border:1px solid var(--border);background:${room.active ? '#c0392b' : 'var(--brass-bright)'};color:${room.active ? 'white' : 'var(--bg)'};border-radius:4px;cursor:pointer">
                        ${room.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="deleteRoom(${room.venueId})" style="padding:6px 12px;border:1px solid var(--border);background:#c0392b;color:white;border-radius:4px;cursor:pointer">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching rooms:', error);
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">Error loading rooms</td></tr>';
    }
}

// Reset filter
function resetFilter() {
    document.getElementById('filterCapacity').value = 0;
    fetchRooms();
}

// Open modal for new room
function openNewModal() {
    document.getElementById('modalTitle').textContent = 'Add New Room / Hall';
    document.getElementById('modalVenueId').value = '';
    document.getElementById('modalHallName').value = '';
    document.getElementById('modalCapacity').value = '';
    document.getElementById('modalDescription').value = '';
    document.getElementById('modalImageUrl').value = '';
    
    // Hide errors
    document.getElementById('errHallName').classList.remove('visible');
    document.getElementById('errCapacity').classList.remove('visible');
    
    document.getElementById('roomModal').classList.add('active');
}

// Edit existing room
async function editRoom(venueId) {
    try {
        const response = await fetch(`${API_BASE}?minCapacity=0`);
        const rooms = await response.json();
        const room = rooms.find(r => r.venueId === venueId);
        
        if (!room) {
            showToast('Room not found');
            return;
        }
        
        document.getElementById('modalTitle').textContent = 'Edit Room / Hall';
        document.getElementById('modalVenueId').value = room.venueId;
        document.getElementById('modalHallName').value = room.hallName;
        document.getElementById('modalCapacity').value = room.capacity;
        document.getElementById('modalDescription').value = room.description || '';
        document.getElementById('modalImageUrl').value = room.imageUrl || '';
        
        // Hide errors
        document.getElementById('errHallName').classList.remove('visible');
        document.getElementById('errCapacity').classList.remove('visible');
        
        document.getElementById('roomModal').classList.add('active');
    } catch (error) {
        console.error('Error fetching room:', error);
        showToast('Error loading room details');
    }
}

// Close modal
function closeModal() {
    document.getElementById('roomModal').classList.remove('active');
}

// Save room (create or update)
async function saveRoom() {
    const venueId = document.getElementById('modalVenueId').value;
    const hallName = document.getElementById('modalHallName').value.trim();
    const capacity = parseInt(document.getElementById('modalCapacity').value);
    const description = document.getElementById('modalDescription').value.trim();
    const imageUrl = document.getElementById('modalImageUrl').value.trim();
    
    // Validation
    let hasError = false;
    
    if (!hallName) {
        document.getElementById('errHallName').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errHallName').classList.remove('visible');
    }
    
    if (!capacity || capacity < 1) {
        document.getElementById('errCapacity').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errCapacity').classList.remove('visible');
    }
    
    if (hasError) return;
    
    const roomData = {
        hallName,
        capacity,
        description: description || null,
        imageUrl: imageUrl || null
    };
    
    try {
        let response;
        if (venueId) {
            // Update
            response = await fetch(`${API_BASE}/${venueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        } else {
            // Create
            response = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        }
        
        if (response.ok) {
            closeModal();
            fetchRooms();
            showToast(venueId ? 'Room updated successfully' : 'Room created successfully');
        } else {
            showToast('Error saving room');
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showToast('Error saving room');
    }
}

// Toggle room active status
async function toggleStatus(venueId, currentStatus) {
    try {
        const response = await fetch(`${API_BASE}/${venueId}/deactivate`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            fetchRooms();
            showToast(currentStatus ? 'Room deactivated' : 'Room activated');
        } else {
            showToast('Error updating status');
        }
    } catch (error) {
        console.error('Error toggling status:', error);
        showToast('Error updating status');
    }
}

// Delete room
async function deleteRoom(venueId) {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${venueId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchRooms();
            showToast('Room deleted successfully');
        } else {
            showToast('Error deleting room');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showToast('Error deleting room');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchRooms();
    
    // Close modal on outside click
    document.getElementById('roomModal').addEventListener('click', (e) => {
        if (e.target.id === 'roomModal') {
            closeModal();
        }
    });
});

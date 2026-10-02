// Room Management Admin Dashboard - CRUD Operations

const API_BASE = '/api';
let roomTypes = [];

// Fetch room types on page load
async function fetchRoomTypes() {
    try {
        const response = await fetch(`${API_BASE}/room-types`);
        roomTypes = await response.json();
        
        // Populate filter dropdown
        const filterSelect = document.getElementById('filterRoomType');
        filterSelect.innerHTML = '<option value="">All Types</option>';
        roomTypes.forEach(type => {
            filterSelect.innerHTML += `<option value="${type.roomTypeId}">${type.typeName}</option>`;
        });
        
        // Populate modal dropdown
        const modalSelect = document.getElementById('modalRoomType');
        modalSelect.innerHTML = '<option value="">Select Room Type</option>';
        roomTypes.forEach(type => {
            modalSelect.innerHTML += `<option value="${type.roomTypeId}">${type.typeName}</option>`;
        });
    } catch (error) {
        console.error('Error fetching room types:', error);
    }
}

// Fetch and display rooms
async function fetchRooms() {
    const roomTypeId = document.getElementById('filterRoomType').value;
    const status = document.getElementById('filterStatus').value;
    const floor = document.getElementById('filterFloor').value;
    const tableBody = document.getElementById('tableBody');
    
    let url = `${API_BASE}/rooms?`;
    if (roomTypeId) url += `roomTypeId=${roomTypeId}&`;
    if (status) url += `status=${status}&`;
    if (floor) url += `floor=${floor}&`;
    
    try {
        const response = await fetch(url);
        const rooms = await response.json();
        
        if (rooms.length === 0) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No rooms found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = rooms.map(room => {
            const roomType = roomTypes.find(t => t.roomTypeId === room.roomTypeId);
            const statusColor = room.status === 'AVAILABLE' ? 'var(--brass-bright)' : 
                               room.status === 'OCCUPIED' ? '#e74c3c' : '#f39c12';
            
            return `
            <tr>
                <td>${room.roomId}</td>
                <td><strong>${room.roomNumber}</strong></td>
                <td>${roomType ? roomType.typeName : 'Unknown'}</td>
                <td>${room.floor}</td>
                <td>$${parseFloat(room.price).toFixed(2)}</td>
                <td>
                    <span style="padding:4px 10px;border-radius:12px;font-size:11px;background:${statusColor};color:var(--bg)">
                        ${room.status}
                    </span>
                </td>
                <td>
                    <button onclick="editRoom(${room.roomId})" style="padding:6px 12px;margin-right:4px;border:1px solid var(--border);background:var(--surface-alt);color:var(--ivory);border-radius:4px;cursor:pointer">Edit</button>
                    <button onclick="deleteRoom(${room.roomId})" style="padding:6px 12px;border:1px solid var(--border);background:#c0392b;color:white;border-radius:4px;cursor:pointer">Delete</button>
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error fetching rooms:', error);
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">Error loading rooms</td></tr>';
    }
}

// Reset filter
function resetFilter() {
    document.getElementById('filterRoomType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterFloor').value = '';
    fetchRooms();
}

// Open modal for new room
function openNewModal() {
    document.getElementById('modalTitle').textContent = 'Add New Room';
    document.getElementById('modalRoomId').value = '';
    document.getElementById('modalRoomNumber').value = '';
    document.getElementById('modalRoomType').value = '';
    document.getElementById('modalFloor').value = '';
    document.getElementById('modalPrice').value = '';
    document.getElementById('modalStatus').value = 'AVAILABLE';
    
    // Hide errors
    document.getElementById('errRoomNumber').classList.remove('visible');
    document.getElementById('errRoomType').classList.remove('visible');
    document.getElementById('errFloor').classList.remove('visible');
    document.getElementById('errPrice').classList.remove('visible');
    
    document.getElementById('roomModal').classList.add('active');
}

// Edit existing room
async function editRoom(roomId) {
    try {
        const response = await fetch(`${API_BASE}/rooms/${roomId}`);
        const room = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Room';
        document.getElementById('modalRoomId').value = room.roomId;
        document.getElementById('modalRoomNumber').value = room.roomNumber;
        document.getElementById('modalRoomType').value = room.roomTypeId;
        document.getElementById('modalFloor').value = room.floor;
        document.getElementById('modalPrice').value = room.price;
        document.getElementById('modalStatus').value = room.status;
        
        // Hide errors
        document.getElementById('errRoomNumber').classList.remove('visible');
        document.getElementById('errRoomType').classList.remove('visible');
        document.getElementById('errFloor').classList.remove('visible');
        document.getElementById('errPrice').classList.remove('visible');
        
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
    const roomId = document.getElementById('modalRoomId').value;
    const roomNumber = document.getElementById('modalRoomNumber').value.trim();
    const roomTypeId = document.getElementById('modalRoomType').value;
    const floor = document.getElementById('modalFloor').value;
    const price = document.getElementById('modalPrice').value;
    const status = document.getElementById('modalStatus').value;
    
    // Validation
    let hasError = false;
    
    if (!roomNumber) {
        document.getElementById('errRoomNumber').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errRoomNumber').classList.remove('visible');
    }
    
    if (!roomTypeId) {
        document.getElementById('errRoomType').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errRoomType').classList.remove('visible');
    }
    
    if (!floor || floor < 1) {
        document.getElementById('errFloor').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errFloor').classList.remove('visible');
    }
    
    if (!price || price < 0) {
        document.getElementById('errPrice').classList.add('visible');
        hasError = true;
    } else {
        document.getElementById('errPrice').classList.remove('visible');
    }
    
    if (hasError) return;
    
    const roomData = {
        roomNumber,
        roomTypeId: parseInt(roomTypeId),
        floor: parseInt(floor),
        price: parseFloat(price),
        status
    };
    
    try {
        let response;
        if (roomId) {
            // Update
            response = await fetch(`${API_BASE}/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        } else {
            // Create
            response = await fetch(`${API_BASE}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        }
        
        if (response.ok) {
            closeModal();
            fetchRooms();
            showToast(roomId ? 'Room updated successfully' : 'Room created successfully');
        } else {
            const error = await response.json();
            showToast(error.message || 'Error saving room');
        }
    } catch (error) {
        console.error('Error saving room:', error);
        showToast('Error saving room');
    }
}

// Delete room
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
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
    fetchRoomTypes().then(() => fetchRooms());
    
    // Close modal on outside click
    document.getElementById('roomModal').addEventListener('click', (e) => {
        if (e.target.id === 'roomModal') {
            closeModal();
        }
    });
});

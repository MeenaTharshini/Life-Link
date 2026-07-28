import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Droplets,
  MapPin,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Phone,
  Hospital,
  Trash2,
  User,
  Syringe,
} from "lucide-react";

import "./Notifications.css";
const API = import.meta.env.VITE_API_URL;
export default function Notifications() {

  const { donor, profile,
    setAcceptedCount } = useAuth();

const userId = profile?.id;
const donorId = donor?.id;
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRequests, setShowRequests] = useState(false);

  const [requests, setRequests] = useState([]);

  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
  if (donor) {
    loadNotifications();
  } else {
    setNotifications([]);
    setLoading(false);
  }

  if (profile) {
    loadRequests();
  }
}, [donor, profile]);

  
  async function loadNotifications() {
  console.log("loadNotifications called");

  setLoading(true);

  if (!donor) {
    console.log("No donor");
    setNotifications([]);
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
  .from("notifications")
  .select("*")
  .eq("donor_id", donor.id)
  .order("created_at", { ascending: false });

  
  if (error) {
    console.error(error);
    setLoading(false);
    return;
  }

  setNotifications(data || []);
  setLoading(false);
}


  async function loadRequests() {

    try {

      const res = await axios.get(
  `${API}/api/responses/hospital/${profile.id}`
);

      const requestData = res.data || [];

setRequests(requestData);

// Count total accepted donors
const totalAccepted = requestData.reduce(
  (total, req) => total + req.accepted_donors.length,
  0
);

setAcceptedCount(totalAccepted);

    } catch (err) {

      console.log(err);

    }

  }
  async function deleteRequest(requestId) {
  const ok = window.confirm(
    "Are you sure you want to delete this blood request?"
  );

  if (!ok) return;

  try {
    await axios.delete(
  `${API}/api/requests/${requestId}`
);

    loadRequests();

    alert("Request deleted successfully.");

  } catch (err) {

    alert(
      err.response?.data?.error || "Unable to delete request."
    );

  }
}
  async function acceptDonation(notification) {

    try {

      await axios.post(
  `${API}/api/responses/accept`,
  {
    donor_id: donor.id,
    request_id: notification.request_id,
    distance: notification.distance,
  }
);

      await supabase
        .from("notifications")
        .update({
          status: "accepted",
          is_read: true,
        })
        .eq("id", notification.id);

      loadNotifications();

    } catch (err) {

      alert(err.response?.data?.error || "Unable to accept");

    }

  }

  const urgencyClass = u => {

    if (u === "critical") return "critical";

    if (u === "urgent") return "urgent";

    return "normal";

  };

  return (

<div className="notification-page">

<div className="notification-header">

<div>

<h1>

<Bell size={28}/>

Notifications

</h1>

<p>Emergency blood requests near you</p>

</div>

<div>

<button
className="myRequestsBtn"
onClick={() => {
    setShowRequests(true);
    loadRequests();
}}
>

My Requests

</button>

</div>

</div>

{loading ?

(
  <div className="empty-card">
    Loading...
  </div>
) : notifications.length === 0 ? (
  <div className="empty-card">
  <Bell size={40} />

  <h3>No Notifications Yet</h3>

  <p>
    {donor
      ? "There are no blood requests matching you right now."
      : "You are not registered as a donor. Register now to receive emergency blood request notifications."}
  </p>

  {!donor && (
    <button
      className="registerDonorBtn"
      onClick={() => navigate("/register-donor")} // change to your route
    >
      <Droplets size={18} />
      Register as Donor
    </button>
  )}
</div>
)

:
<div className="notification-grid">
{notifications.map(n=>(

<div
key={n.id}
className={`notification-card ${urgencyClass(n.urgency)}`}
>

<div className="card-header">

<div className="blood">

<Droplets size={15}/>

{n.blood_group}

</div>

<div className={`badge ${urgencyClass(n.urgency)}`}>

<AlertTriangle size={14}/>

{n.urgency}

</div>

</div>

<div className="requester">

<p className="iconText">
  <Hospital size={16} />
  <strong>{n.requester_name}</strong>
</p>

<p className="iconText">
  <Phone size={16} />
  {n.requester_phone}
</p>

</div>

<div className="info">

<span>

<MapPin size={15}/>

{n.address}
</span>

<span>
  <Syringe size={15} />
  {n.units} Units
</span>

<span>

<Clock3 size={15}/>

{new Date(n.created_at).toLocaleString()}

</span>

</div>

{n.status==="accepted"?

<button
disabled
className="accepted-btn"
>

Accepted

</button>

:

<button
className="accept-btn"
onClick={()=>acceptDonation(n)}
>

<CheckCircle2 size={17}/>

I'll Donate

</button>

}

</div>

))}
</div>

}


<div className={`requestsDrawer ${showRequests?"open":""}`}>

<div className="drawerHeader">

<h2>My Requests</h2>

<button
onClick={()=>setShowRequests(false)}
>

✕

</button>

</div>

{requests.length === 0 ? (

  <div className="empty">
    <Droplets size={45} className="emptyIcon" />

    <h2>No Blood Requests Yet</h2>

    <p>
      You haven't created any blood requests. Create one now to
      notify nearby compatible donors.
    </p>

    <button
      className="createRequestBtn"
      onClick={() => navigate("/create-request")}
    >
      <Droplets size={18} />
      Create Blood Request
    </button>
  </div>

)

:

requests.map((req,index)=>(

<div
className="requestCard"
key={index}
>

<div className="requestTop">

<div>

<h3>

<Droplets size={18}/>

{req.blood_requests.blood_group}

</h3>

<p>

<MapPin size={15}/>

{req.blood_requests.address}

</p>

<p className="iconText">
  <Syringe size={15} />
  {req.blood_requests.units} Units
</p>
<button
  className="deleteBtn"
  onClick={() => deleteRequest(req.blood_requests.id)}
>
  Delete Request
</button>
</div>

</div>

<button
className="donorCountBtn"
onClick={()=>setExpanded(
expanded===req.blood_requests.id
?null
:req.blood_requests.id
)}
>

<Users size={16}/>

Accepted Donors ({req.accepted_donors.length})

{expanded===req.blood_requests.id?

<ChevronUp size={16}/>

:

<ChevronDown size={16}/>

}

</button>

{expanded===req.blood_requests.id&&

<div className="donorList">

{req.accepted_donors.length===0?

<p>No donors yet.</p>

:

req.accepted_donors.map(d=>(
<div 
className="donorCard"
key={d.id}
>

<h4 className="iconText">
  <User size={16} />
  {d.name}
</h4>

<p className="iconText">
  <Droplets size={16} />
  {d.blood_group}
</p>

<p className="iconText">
  <Phone size={16} />
  {d.phone}
</p>

<a 
href={`tel:${d.phone}`}
className="callBtn"
>
Call Donor
</a>

</div>

))

}

</div>

}

</div>

))

}

</div>

{showRequests&&

<div
className="drawerOverlay"
onClick={()=>setShowRequests(false)}
></div>

}

</div>

  );

}
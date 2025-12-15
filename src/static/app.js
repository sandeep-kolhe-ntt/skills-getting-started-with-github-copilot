document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants section
        let participantsSection;
        if (details.participants.length > 0) {
          participantsSection = document.createElement("div");
          participantsSection.className = "participants-section";
          const strong = document.createElement("strong");
          strong.textContent = "Participants:";
          participantsSection.appendChild(strong);
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          details.participants.forEach(email => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            const span = document.createElement("span");
            span.textContent = email;
            span.style.flex = "1";
            const delBtn = document.createElement("button");
            delBtn.innerHTML = "🗑️";
            delBtn.title = "Unregister";
            delBtn.className = "delete-participant-btn";
            delBtn.style.marginLeft = "8px";
            delBtn.style.background = "none";
            delBtn.style.border = "none";
            delBtn.style.cursor = "pointer";
            delBtn.onclick = async () => {
              await unregisterParticipant(name, email);
            };
            li.appendChild(span);
            li.appendChild(delBtn);
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          participantsSection = document.createElement("div");
          participantsSection.className = "participants-section no-participants";
          const em = document.createElement("em");
          em.textContent = "No participants yet.";
          participantsSection.appendChild(em);
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
      // Unregister participant function
      async function unregisterParticipant(activity, email) {
        if (!confirm(`Remove ${email} from ${activity}?`)) return;
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: "POST"
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message || "Participant removed.";
            messageDiv.className = "success";
            fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "Failed to remove participant.";
            messageDiv.className = "error";
          }
          messageDiv.classList.remove("hidden");
          setTimeout(() => messageDiv.classList.add("hidden"), 5000);
        } catch (error) {
          messageDiv.textContent = "Error removing participant.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          setTimeout(() => messageDiv.classList.add("hidden"), 5000);
        }
      }
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

const compatibility = require("./compatibility");
const getDistance = require("./distance");

function getDistanceScore(distance) {
  if (distance <= 5) return 30;
  if (distance <= 10) return 25;
  if (distance <= 20) return 20;
  if (distance <= 35) return 15;
  if (distance <= 50) return 10;
  if (distance <= 100) return 5;

  return 0;
}

function getDonorScore(donor, distance) {
  let score = 0;

  // Closer donors get higher priority
  score += getDistanceScore(distance);

  // Only available donors should normally be notified
  if (donor.available === true) {
    score += 20;
  }

  // Add points if your donors table has a verified column
  if (donor.verified === true) {
    score += 10;
  }

  return score;
}

function getSearchRadii(urgency) {
  if (urgency === "critical") {
    return [10, 25, 50, 75, 100];
  }

  if (urgency === "urgent") {
    return [10, 25, 50, 75];
  }

  return [10, 25, 50];
}

function findMatchingDonors({
  donors,
  bloodGroup,
  latitude,
  longitude,
  urgency,
  requesterId,
  requiredDonors = 5,
}) {
  const compatibleGroups = compatibility[bloodGroup] || [];

  const matches = donors
    // 1. Blood compatibility
    .filter((donor) =>
      compatibleGroups.includes(donor.blood_group)
    )

    // 2. Don't notify requester if they are also in donors
    .filter(
      (donor) =>
        String(donor.user_id) !== String(requesterId)
    )

    // 3. Only donors with location
    .filter(
      (donor) =>
        donor.latitude != null &&
        donor.longitude != null
    )

    // 4. Calculate distance
    .map((donor) => {
      const distance = getDistance(
        Number(latitude),
        Number(longitude),
        Number(donor.latitude),
        Number(donor.longitude)
      );

      return {
        ...donor,
        distance,
        score: getDonorScore(donor, distance),
      };
    })

    // 5. Sort best donors first
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.distance - b.distance;
    });

  const radii = getSearchRadii(urgency);

  // Progressive search
  for (const radius of radii) {
    const nearby = matches.filter(
      (donor) => donor.distance <= radius
    );

    if (nearby.length >= requiredDonors) {
      return nearby.slice(0, requiredDonors);
    }
  }

  // If we still don't have enough donors,
  // return everyone available within the maximum radius.
  const maxRadius = radii[radii.length - 1];

  return matches
    .filter((donor) => donor.distance <= maxRadius)
    .slice(0, requiredDonors);
}

module.exports = {
  findMatchingDonors,
};
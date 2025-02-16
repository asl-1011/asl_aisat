export async function GET() {
    const managerProfile = {
      name: "John Doe",
      email: "johndoe@example.com",
      team: "ASL United",
      budgetSpent: "$500,000",
      winPercentage: "72%",
      match_win: 45,
      managerRank: 3,
      players: [
        {
          name: "Player 1",
          position: "Forward",
          profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
          price: "$120,000",
          points: 95,
          goals: 30,
        },
        {
          name: "Player 2",
          position: "Midfielder",
          profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
          price: "$80,000",
          points: 85,
          goals: 18,
        },
      ],
    };
  
    return Response.json(managerProfile);
  }
  
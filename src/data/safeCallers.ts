export interface SafeCaller {
  id: string;
  name: string;
  imageUrl: string;
  audioUrl: string;
  dateAdded: string;
  role: string;
  isYou: boolean;
}

export const safeCallersData: SafeCaller[] = [
  {
    id: '1',
    name: 'Sathyajit Loganathan',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQEPNfAKkRkbHg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1664529744668?e=2147483647&v=beta&t=7TGjBa44VEDkzhxAjrm1x94QU9UaowN15YTBqorwQ1c',
    audioUrl: '/audio/jane-sample.mp3',
    dateAdded: '2025-07-15',
    role: 'Self',
    isYou: true
  },
  {
    id: '2',
    name: 'Kapeesh Kaul',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQFd9MBml-FexQ/profile-displayphoto-shrink_200_200/B56Zb08lIBG4AY-/0/1747866243931?e=2147483647&v=beta&t=87j0NSVdBCTzZe_j8WqB6FLv-apck0hTRA-VGJhK0wE',
    audioUrl: '/audio/john-sample.mp3',
    dateAdded: '2025-07-28',
    role: 'Friend',
    isYou: false,
  },
  {
    id: '3',
    name: 'Neil Jerome Tauro',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQGyHbt9e2ZMtw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1724951605858?e=2147483647&v=beta&t=x93qgSXDimQQDtWPpAIXdpW9SNec9-ZrNXH-u_0rPB4',
    audioUrl: '/audio/sarah-sample.mp3',
    dateAdded: '2025-08-02',
    role: 'Neighbor',
    isYou: false,
  },
];

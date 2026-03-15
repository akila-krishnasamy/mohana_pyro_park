const videoLinks = [
  'https://youtube.com/shorts/7sMLh-gEt9g?si=p3C6uC-1BlU2nQio',
  'https://youtube.com/shorts/Yjn9V0j6u-o?si=umlhf90SN8JQjcTc',
  'https://youtu.be/XOwwA3RkoYE?si=JRGgafN1o3YOQZV5',
  'https://youtu.be/thR7ODBMzAY?si=3dQZQuvBzbsD68EO',
  'https://youtu.be/PdPUJVmaD7o?si=5lZ1fA-OdP9YkPR6',
  'https://youtu.be/zxckfcXKhhs?si=DekZb7hC9eNCFnCG',
  'https://youtu.be/QBZKzfhSABQ?si=mK78BiDu9Tc9cPz6',
  'https://youtu.be/FdQh6kEtyls?si=IQ_iTS7ZigEvD3z1',
  'https://youtu.be/AEiKt_Onp6c?si=vJCl6Q90vI3rZQxa',
  'https://youtu.be/XG_AdPMVsu4?si=OZBD7E6THfvsZx-u',
  'https://youtu.be/hyyM3qhInO0?si=04NQy4DhA2UGaOBH',
  'https://youtu.be/g0mHWJcLAvw?si=CvLjEVtgiSxPfHQa',
  'https://youtu.be/b_Q1-po-n5Y?si=bjfA6jXDyO9S1-X6',
  'https://youtube.com/shorts/wokH7pIH_pM?si=L0HXHm-SEsHTH1Ea',
];

const getYouTubeVideoId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace('www.', '');
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

    if (host === 'youtu.be') {
      return pathParts[0] || null;
    }

    if ((host === 'youtube.com' || host === 'm.youtube.com') && pathParts[0] === 'shorts') {
      return pathParts[1] || null;
    }

    if ((host === 'youtube.com' || host === 'm.youtube.com') && parsedUrl.pathname === '/watch') {
      return parsedUrl.searchParams.get('v');
    }

    if ((host === 'youtube.com' || host === 'm.youtube.com') && pathParts[0] === 'embed') {
      return pathParts[1] || null;
    }

    return null;
  } catch {
    return null;
  }
};

const MediaGallery = () => {
  const videos = videoLinks
    .map((url, index) => ({
      id: getYouTubeVideoId(url),
      url,
      title: `Mohana Pyro Park Video ${index + 1}`,
    }))
    .filter((video) => Boolean(video.id));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-gradient-primary py-10 shadow-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Media Gallery 🎥✨ </h1>
          <div className="mt-2 text-primary-100 text-sm md:text-base">
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white p-3 rounded-lg shadow-sm">
              <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;

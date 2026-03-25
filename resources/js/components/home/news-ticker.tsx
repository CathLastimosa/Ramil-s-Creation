import '../../../css/news.css';

type NewsProps = {
    promo?: number;
}

export default function News({ promo }: NewsProps) {
  if (!promo || promo <= 0) {
    return null;
  }

  const newsItems = [];

  for (let i = 0; i < 10; i++) {
    newsItems.push(
      <div key={i} className="news-wrapper">
        <div className="news-slide">
          <h2>{`${promo}% Off`}</h2>
          <p>Wedding Package <b>Promo</b></p>
        </div>
        <div className="star-symbols">
          &#9733;
          &#9733;
          &#9733;
        </div>
      </div>
    );
  }

  return (
    <div className="news-ticker-wrapper">
      <div className="news-ticker">
        {newsItems}
      </div>
    </div>
  );
}

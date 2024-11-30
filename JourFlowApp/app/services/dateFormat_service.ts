const date_format = (receiveDate: Date, weekdayFormat: "long" | "short" = "long") => {
  const includeYear = weekdayFormat === "long"; // Nếu weekday là "long", thì bao gồm năm
  const options = {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined, // Thêm hoặc bỏ year dựa trên weekdayFormat
      weekday: weekdayFormat,
  } as Intl.DateTimeFormatOptions;

  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(receiveDate);
  const parts = formattedDate.split(", ");

  const weekday = parts[0]; // Weekday luôn ở vị trí đầu
  const monthDay = parts[1]; // Month và Day
  const year = includeYear ? parts[2] : undefined;

  return {
      fullDate: includeYear ? `${monthDay}, ${year}` : monthDay, // Định nghĩa fullDate
      weekday: weekday,
      date: receiveDate,
  };
};

export default date_format;

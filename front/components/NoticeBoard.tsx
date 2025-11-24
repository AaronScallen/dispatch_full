import { Notice } from "../types";

export default function NoticeBoard({ data }: { data: Notice[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 sm:p-3 md:p-4 shadow-lg">
      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-purple-400 uppercase tracking-wide mb-2 sm:mb-3 md:mb-4">
        Notices
      </h2>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {data.map((notice) => (
          <div
            key={notice.id}
            className="bg-slate-800 p-2 sm:p-2.5 md:p-3 rounded border-l-2 sm:border-l-4 border-purple-500"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white font-bold text-xs sm:text-sm md:text-base">
                {notice.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap ml-2">
                {new Date(notice.notice_date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-300">
              {notice.text_content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

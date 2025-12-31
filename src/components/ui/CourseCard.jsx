import React from 'react';

export default function CourseCard ({ title, description, duration, department, image, professor, author }) {
	const divRef = React.useRef(null);

	const displayTitle = title || 'Course Title';
	const displayDescription = description || 'Short description of the course goes here.';
	const displayDuration = duration || '12 weeks';
	const displayDepartment = department || 'Department';
	const displayProfessor = professor || author || null;
	const displayImage = image || 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp';

	return (
    <div
      ref={divRef}
      className="relative w-full max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="w-full">
        <img
          className="w-full h-48 sm:h-56 object-cover object-top"
          src={displayImage}
          alt={displayTitle}
        />
      </div>
      <div className="p-6 pb-7">
        <h5 className="mb-2 text-lg font-semibold tracking-tight text-zinc-900">
						{displayTitle}
					</h5>
        <p
          className="mb-4 text-zinc-700"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {displayDescription}
        </p>
        <div className="mb-6 text-sm text-zinc-700 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">Duration: {displayDuration}</span>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">Department: {displayDepartment}</span>
					{displayProfessor && (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">Professor: {displayProfessor}</span>
					)}
				</div>
        <div className="pt-1 pb-1">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800"
          >
					Learn more
          </button>
        </div>
			</div>
		</div>
	);
};
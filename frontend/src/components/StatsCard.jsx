function StatsCard({ title, value, icon, color }) {

    return (

        <div
            className={`relative overflow-hidden rounded-2xl ${color}
            text-white p-6 shadow-xl hover:shadow-2xl
            hover:-translate-y-2 transition-all duration-300`}
        >

            {/* Background Circle */}

            <div
                className="absolute -right-8 -top-8
                w-32 h-32 rounded-full bg-white/10"
            ></div>

            {/* Icon */}

            <div
                className="w-14 h-14 rounded-xl
                bg-white/20 flex items-center
                justify-center text-3xl mb-6"
            >
                {icon}
            </div>

            {/* Title */}

            <p className="text-white/80 text-sm uppercase tracking-wider">

                {title}

            </p>

            {/* Value */}

            <h2 className="text-4xl font-bold mt-2">

                {value}

            </h2>

        </div>

    );

}

export default StatsCard;
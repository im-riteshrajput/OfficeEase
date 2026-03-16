function StatCard(props) {
    return (
        <>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{props.title}</p>
                        <p className="text-3xl font-bold text-card-foreground mt-1">{props.value}</p>
                        {props.trend && (
                            <p className={`text-xs mt-2 font-medium ${props.trendUp ? "text-success" : "text-destructive"}`}>
                                {props.trend}
                            </p>
                        )}
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-accent/20 flex items-center justify-center">
                        {/* <Icon className="w-5 h-5 text-accent" /> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default StatCard
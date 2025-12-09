
export default function IconComponent({ img, amount, size = 16 }: { img: string, amount?: number, size?: number }) {
    return (
        <div className="flex flex-row items-center">
            {
                [...Array(amount)].map((_, index) => {
                    return <img key={index} src={img} alt="" className="object-contain" style={{ width: `${size}px`, height: `${size}px` }}/>
                })
            }
        </div>
    )
}
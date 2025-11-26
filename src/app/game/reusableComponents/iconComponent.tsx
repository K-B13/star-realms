
export default function IconComponent({ img, amount }: { img: string, amount?: number }) {
    return (
        <div className="flex flex-row">
            {
                [...Array(amount)].map((_, index) => {
                    return <img key={index} src={img} alt="" width={'20rem'} height={'20rem'}/>
                })
            }
        </div>
    )
}
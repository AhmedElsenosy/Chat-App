
const MessageContainer = ({messages}) => {
return <div>
    {
        messages.map((message,index) => 
            <table striped bordered hover key={index}>
                <thead>
                    <tr>
                        <th>{message.user}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{message.message}</td>
                    </tr>
                </tbody>
            </table>
        )
    }
    <h2>Message Container</h2>
</div>
}
export default MessageContainer;

const IssueReporter = ({className = ''}) => {
  return <div className={className}>
    <a href='https://github.com/neonlabsorg/neon-client-transfer/issues/new'
      target='_blank' rel='noopener noreferrer' className='text-blue-500 hover:text-blue-600'>
        Report an issue
      </a>
  </div>
}

export default IssueReporter
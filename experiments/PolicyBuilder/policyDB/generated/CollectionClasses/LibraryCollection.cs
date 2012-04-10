///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Data;
using System.Collections.Generic;
using System.ComponentModel;
using System.Xml;
#if !CF
using System.Runtime.Serialization;
#endif

using policyDB.EntityClasses;
using policyDB.FactoryClasses;
using policyDB.DaoClasses;
using policyDB.HelperClasses;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.CollectionClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END

	/// <summary>Collection class for storing and retrieving collections of LibraryEntity objects. </summary>
	[Serializable]
	public partial class LibraryCollection : EntityCollectionBase<LibraryEntity>
	{
		/// <summary> CTor</summary>
		public LibraryCollection():base(new LibraryEntityFactory())
		{
		}

		/// <summary> CTor</summary>
		/// <param name="initialContents">The initial contents of this collection.</param>
		public LibraryCollection(IList<LibraryEntity> initialContents):base(new LibraryEntityFactory())
		{
			AddRange(initialContents);
		}

		/// <summary> CTor</summary>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		public LibraryCollection(IEntityFactory entityFactoryToUse):base(entityFactoryToUse)
		{
		}

		/// <summary> Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected LibraryCollection(SerializationInfo info, StreamingContext context) : base(info, context)
		{
		}



		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  Relation of type 'm:n' with the passed in CombineModeEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingCombineModeCollectionViaPolicy(IEntity combineModeInstance)
		{
			return GetMultiManyToManyUsingCombineModeCollectionViaPolicy(combineModeInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, 0, 0);
		}
		
		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in CombineModeEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingCombineModeCollectionViaPolicy(IEntity combineModeInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			return GetMultiManyToManyUsingCombineModeCollectionViaPolicy(combineModeInstance, maxNumberOfItemsToReturn, sortClauses, 0, 0);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in CombineModeEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public virtual bool GetMultiManyToManyUsingCombineModeCollectionViaPolicy(IEntity combineModeInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, int pageNumber, int pageSize)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingCombineModeCollectionViaPolicy(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, combineModeInstance, pageNumber, pageSize);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a Relation of type 'm:n' with the passed in CombineModeEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingCombineModeCollectionViaPolicy(IEntity combineModeInstance, IPrefetchPath prefetchPathToUse)
		{
			return GetMultiManyToManyUsingCombineModeCollectionViaPolicy(combineModeInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, prefetchPathToUse);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in CombineModeEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingCombineModeCollectionViaPolicy(IEntity combineModeInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPrefetchPath prefetchPathToUse)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingCombineModeCollectionViaPolicy(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, combineModeInstance, prefetchPathToUse);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  Relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(IEntity policyLinkInstance)
		{
			return GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(policyLinkInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, 0, 0);
		}
		
		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(IEntity policyLinkInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			return GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(policyLinkInstance, maxNumberOfItemsToReturn, sortClauses, 0, 0);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public virtual bool GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(IEntity policyLinkInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, int pageNumber, int pageSize)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingPolicyLinkCollectionViaPolicyDocument(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, policyLinkInstance, pageNumber, pageSize);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a Relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(IEntity policyLinkInstance, IPrefetchPath prefetchPathToUse)
		{
			return GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(policyLinkInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, prefetchPathToUse);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingPolicyLinkCollectionViaPolicyDocument(IEntity policyLinkInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPrefetchPath prefetchPathToUse)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingPolicyLinkCollectionViaPolicyDocument(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, policyLinkInstance, prefetchPathToUse);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  Relation of type 'm:n' with the passed in TargetEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingTargetCollectionViaPolicy(IEntity targetInstance)
		{
			return GetMultiManyToManyUsingTargetCollectionViaPolicy(targetInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, 0, 0);
		}
		
		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in TargetEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingTargetCollectionViaPolicy(IEntity targetInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			return GetMultiManyToManyUsingTargetCollectionViaPolicy(targetInstance, maxNumberOfItemsToReturn, sortClauses, 0, 0);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in TargetEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public virtual bool GetMultiManyToManyUsingTargetCollectionViaPolicy(IEntity targetInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, int pageNumber, int pageSize)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingTargetCollectionViaPolicy(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, targetInstance, pageNumber, pageSize);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a Relation of type 'm:n' with the passed in TargetEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingTargetCollectionViaPolicy(IEntity targetInstance, IPrefetchPath prefetchPathToUse)
		{
			return GetMultiManyToManyUsingTargetCollectionViaPolicy(targetInstance, base.MaxNumberOfItemsToReturn, base.SortClauses, prefetchPathToUse);
		}

		/// <summary> Retrieves in this LibraryCollection object all LibraryEntity objects which are related via a  relation of type 'm:n' with the passed in TargetEntity. 
		/// All current elements in the collection are removed from the collection.</summary>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if the retrieval succeeded, false otherwise</returns>
		public bool GetMultiManyToManyUsingTargetCollectionViaPolicy(IEntity targetInstance, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPrefetchPath prefetchPathToUse)
		{
			if(!base.SuppressClearInGetMulti)
			{
				this.Clear();
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiUsingTargetCollectionViaPolicy(base.Transaction, this, maxNumberOfItemsToReturn, sortClauses, base.EntityFactoryToUse, targetInstance, prefetchPathToUse);
		}


		/// <summary> Retrieves Entity rows in a datatable which match the specified filter. It will always create a new connection to the database.</summary>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <returns>DataTable with the rows requested.</returns>
		public static DataTable GetMultiAsDataTable(IPredicate selectFilter, long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			return GetMultiAsDataTable(selectFilter, maxNumberOfItemsToReturn, sortClauses, null, 0, 0);
		}

		/// <summary> Retrieves Entity rows in a datatable which match the specified filter. It will always create a new connection to the database.</summary>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="relations">The set of relations to walk to construct to total query.</param>
		/// <returns>DataTable with the rows requested.</returns>
		public static DataTable GetMultiAsDataTable(IPredicate selectFilter, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IRelationCollection relations)
		{
			return GetMultiAsDataTable(selectFilter, maxNumberOfItemsToReturn, sortClauses, relations, 0, 0);
		}
		
		/// <summary> Retrieves Entity rows in a datatable which match the specified filter. It will always create a new connection to the database.</summary>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="relations">The set of relations to walk to construct to total query.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>DataTable with the rows requested.</returns>
		public static DataTable GetMultiAsDataTable(IPredicate selectFilter, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IRelationCollection relations, int pageNumber, int pageSize)
		{
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetMultiAsDataTable(maxNumberOfItemsToReturn, sortClauses, selectFilter, relations, pageNumber, pageSize);
		}


		
		/// <summary> Gets a scalar value, calculated with the aggregate. the field index specified is the field the aggregate are applied on.</summary>
		/// <param name="fieldIndex">Field index of field to which to apply the aggregate function and expression</param>
		/// <param name="aggregateToApply">Aggregate function to apply. </param>
		/// <returns>the scalar value requested</returns>
		public object GetScalar(LibraryFieldIndex fieldIndex, AggregateFunction aggregateToApply)
		{
			return GetScalar(fieldIndex, null, aggregateToApply, null, null, null);
		}

		/// <summary> Gets a scalar value, calculated with the aggregate and expression specified. the field index specified is the field the expression and aggregate are applied on.</summary>
		/// <param name="fieldIndex">Field index of field to which to apply the aggregate function and expression</param>
		/// <param name="expressionToExecute">The expression to execute. Can be null</param>
		/// <param name="aggregateToApply">Aggregate function to apply. </param>
		/// <returns>the scalar value requested</returns>
		public object GetScalar(LibraryFieldIndex fieldIndex, IExpression expressionToExecute, AggregateFunction aggregateToApply)
		{
			return GetScalar(fieldIndex, expressionToExecute, aggregateToApply, null, null, null);
		}

		/// <summary> Gets a scalar value, calculated with the aggregate and expression specified. the field index specified is the field the expression and aggregate are
		/// applied on.</summary>
		/// <param name="fieldIndex">Field index of field to which to apply the aggregate function and expression</param>
		/// <param name="expressionToExecute">The expression to execute. Can be null</param>
		/// <param name="aggregateToApply">Aggregate function to apply. </param>
		/// <param name="filter">The filter to apply to retrieve the scalar</param>
		/// <returns>the scalar value requested</returns>
		public object GetScalar(LibraryFieldIndex fieldIndex, IExpression expressionToExecute, AggregateFunction aggregateToApply, IPredicate filter)
		{
			return GetScalar(fieldIndex, expressionToExecute, aggregateToApply, filter, null, null);
		}

		/// <summary> Gets a scalar value, calculated with the aggregate and expression specified. the field index specified is the field the expression and aggregate are applied on.</summary>
		/// <param name="fieldIndex">Field index of field to which to apply the aggregate function and expression</param>
		/// <param name="expressionToExecute">The expression to execute. Can be null</param>
		/// <param name="aggregateToApply">Aggregate function to apply. </param>
		/// <param name="filter">The filter to apply to retrieve the scalar</param>
		/// <param name="groupByClause">The groupby clause to apply to retrieve the scalar</param>
		/// <returns>the scalar value requested</returns>
		public object GetScalar(LibraryFieldIndex fieldIndex, IExpression expressionToExecute, AggregateFunction aggregateToApply, IPredicate filter, IGroupByCollection groupByClause)
		{
			return GetScalar(fieldIndex, expressionToExecute, aggregateToApply, filter, null, groupByClause);
		}

		/// <summary> Gets a scalar value, calculated with the aggregate and expression specified. the field index specified is the field the expression and aggregate are applied on.</summary>
		/// <param name="fieldIndex">Field index of field to which to apply the aggregate function and expression</param>
		/// <param name="expressionToExecute">The expression to execute. Can be null</param>
		/// <param name="aggregateToApply">Aggregate function to apply. </param>
		/// <param name="filter">The filter to apply to retrieve the scalar</param>
		/// <param name="relations">The relations to walk</param>
		/// <param name="groupByClause">The groupby clause to apply to retrieve the scalar</param>
		/// <returns>the scalar value requested</returns>
		public virtual object GetScalar(LibraryFieldIndex fieldIndex, IExpression expressionToExecute, AggregateFunction aggregateToApply, IPredicate filter, IRelationCollection relations, IGroupByCollection groupByClause)
		{
			EntityFields fields = new EntityFields(1);
			fields[0] = EntityFieldFactory.Create(fieldIndex);
			if((fields[0].ExpressionToApply == null) || (expressionToExecute != null))
			{
				fields[0].ExpressionToApply = expressionToExecute;
			}
			if((fields[0].AggregateFunctionToApply == AggregateFunction.None) || (aggregateToApply != AggregateFunction.None))
			{
				fields[0].AggregateFunctionToApply = aggregateToApply;
			}
			LibraryDAO dao = DAOFactory.CreateLibraryDAO();
			return dao.GetScalar(fields, base.Transaction, filter, relations, groupByClause);
		}
		
		/// <summary>Creats a new DAO instance so code which is in the base class can still use the proper DAO object.</summary>
		protected override IDao CreateDAOInstance()
		{
			return DAOFactory.CreateLibraryDAO();
		}
		
		/// <summary>Creates a new transaction object</summary>
		/// <param name="levelOfIsolation">The level of isolation.</param>
		/// <param name="name">The name.</param>
		protected override ITransaction CreateTransaction( IsolationLevel levelOfIsolation, string name )
		{
			return new Transaction(levelOfIsolation, name);
		}


		#region Custom EntityCollection code
		
		// __LLBLGENPRO_USER_CODE_REGION_START CustomEntityCollectionCode
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion
		
		#region Included Code

		#endregion
	}
}

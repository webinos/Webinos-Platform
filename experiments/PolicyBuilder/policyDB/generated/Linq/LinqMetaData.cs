///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.Linq
// Templates vendor: Solutions Design.
//////////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using SD.LLBLGen.Pro.LinqSupportClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

using policyDB;
using policyDB.DaoClasses;
using policyDB.EntityClasses;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using policyDB.RelationClasses;

namespace policyDB.Linq
{
	/// <summary>Meta-data class for the construction of Linq queries which are to be executed using LLBLGen Pro code.</summary>
	public class LinqMetaData : ILinqMetaData
	{
		#region Class Member Declarations
		private ITransaction _transactionToUse;
		private FunctionMappingStore _customFunctionMappings;
		private Context _contextToUse;
		#endregion
		
		/// <summary>CTor. Using this ctor will leave the transaction object to use empty. This is ok if you're not executing queries created with this
		/// meta data inside a transaction. If you're executing the queries created with this meta-data inside a transaction, either set the Transaction property
		/// on the IQueryable.Provider instance of the created LLBLGenProQuery object prior to execution or use the ctor which accepts a transaction object.</summary>
		public LinqMetaData() : this(null, null)
		{
		}
		
		/// <summary>CTor. If you're executing the queries created with this meta-data inside a transaction, pass a live ITransaction object to this ctor.</summary>
		/// <param name="transactionToUse">the transaction to use in queries created with this meta-data</param>
		/// <remarks> Be aware that the ITransaction object set via this property is kept alive by the LLBLGenProQuery objects created with this meta data
		/// till they go out of scope.</remarks>
		public LinqMetaData(ITransaction transactionToUse) : this(transactionToUse, null)
		{
		}
		
		/// <summary>CTor. If you're executing the queries created with this meta-data inside a transaction, pass a live ITransaction object to this ctor.</summary>
		/// <param name="transactionToUse">the transaction to use in queries created with this meta-data</param>
		/// <param name="customFunctionMappings">The custom function mappings to use. These take higher precedence than the ones in the DQE to use.</param>
		/// <remarks> Be aware that the ITransaction object set via this property is kept alive by the LLBLGenProQuery objects created with this meta data
		/// till they go out of scope.</remarks>
		public LinqMetaData(ITransaction transactionToUse, FunctionMappingStore customFunctionMappings)
		{
			_transactionToUse = transactionToUse;
			_customFunctionMappings = customFunctionMappings;
		}
		
		/// <summary>returns the datasource to use in a Linq query for the entity type specified</summary>
		/// <param name="typeOfEntity">the type of the entity to get the datasource for</param>
		/// <returns>the requested datasource</returns>
		public IDataSource GetQueryableForEntity(int typeOfEntity)
		{
			IDataSource toReturn = null;
			switch((policyDB.EntityType)typeOfEntity)
			{
				case policyDB.EntityType.AttributeEntity:
					toReturn = this.Attribute;
					break;
				case policyDB.EntityType.AttributeTypeEntity:
					toReturn = this.AttributeType;
					break;
				case policyDB.EntityType.AttributeValueEntity:
					toReturn = this.AttributeValue;
					break;
				case policyDB.EntityType.CombineModeEntity:
					toReturn = this.CombineMode;
					break;
				case policyDB.EntityType.ContextEntity:
					toReturn = this.Context;
					break;
				case policyDB.EntityType.DecisionNodeEntity:
					toReturn = this.DecisionNode;
					break;
				case policyDB.EntityType.EffectEntity:
					toReturn = this.Effect;
					break;
				case policyDB.EntityType.LibraryEntity:
					toReturn = this.Library;
					break;
				case policyDB.EntityType.PolicyEntity:
					toReturn = this.Policy;
					break;
				case policyDB.EntityType.PolicyDocumentEntity:
					toReturn = this.PolicyDocument;
					break;
				case policyDB.EntityType.PolicyLinkEntity:
					toReturn = this.PolicyLink;
					break;
				case policyDB.EntityType.QueryEntity:
					toReturn = this.Query;
					break;
				case policyDB.EntityType.QueryValueEntity:
					toReturn = this.QueryValue;
					break;
				case policyDB.EntityType.RuleEntity:
					toReturn = this.Rule;
					break;
				case policyDB.EntityType.TargetEntity:
					toReturn = this.Target;
					break;
				case policyDB.EntityType.TargetConditionEntity:
					toReturn = this.TargetCondition;
					break;
				case policyDB.EntityType.UriComponentEntity:
					toReturn = this.UriComponent;
					break;
				default:
					toReturn = null;
					break;
			}
			return toReturn;
		}

		/// <summary>returns the datasource to use in a Linq query when targeting AttributeEntity instances in the database.</summary>
		public DataSource<AttributeEntity> Attribute
		{
			get { return new DataSource<AttributeEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting AttributeTypeEntity instances in the database.</summary>
		public DataSource<AttributeTypeEntity> AttributeType
		{
			get { return new DataSource<AttributeTypeEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting AttributeValueEntity instances in the database.</summary>
		public DataSource<AttributeValueEntity> AttributeValue
		{
			get { return new DataSource<AttributeValueEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting CombineModeEntity instances in the database.</summary>
		public DataSource<CombineModeEntity> CombineMode
		{
			get { return new DataSource<CombineModeEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting ContextEntity instances in the database.</summary>
		public DataSource<ContextEntity> Context
		{
			get { return new DataSource<ContextEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting DecisionNodeEntity instances in the database.</summary>
		public DataSource<DecisionNodeEntity> DecisionNode
		{
			get { return new DataSource<DecisionNodeEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting EffectEntity instances in the database.</summary>
		public DataSource<EffectEntity> Effect
		{
			get { return new DataSource<EffectEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting LibraryEntity instances in the database.</summary>
		public DataSource<LibraryEntity> Library
		{
			get { return new DataSource<LibraryEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting PolicyEntity instances in the database.</summary>
		public DataSource<PolicyEntity> Policy
		{
			get { return new DataSource<PolicyEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting PolicyDocumentEntity instances in the database.</summary>
		public DataSource<PolicyDocumentEntity> PolicyDocument
		{
			get { return new DataSource<PolicyDocumentEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting PolicyLinkEntity instances in the database.</summary>
		public DataSource<PolicyLinkEntity> PolicyLink
		{
			get { return new DataSource<PolicyLinkEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting QueryEntity instances in the database.</summary>
		public DataSource<QueryEntity> Query
		{
			get { return new DataSource<QueryEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting QueryValueEntity instances in the database.</summary>
		public DataSource<QueryValueEntity> QueryValue
		{
			get { return new DataSource<QueryValueEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting RuleEntity instances in the database.</summary>
		public DataSource<RuleEntity> Rule
		{
			get { return new DataSource<RuleEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting TargetEntity instances in the database.</summary>
		public DataSource<TargetEntity> Target
		{
			get { return new DataSource<TargetEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting TargetConditionEntity instances in the database.</summary>
		public DataSource<TargetConditionEntity> TargetCondition
		{
			get { return new DataSource<TargetConditionEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		/// <summary>returns the datasource to use in a Linq query when targeting UriComponentEntity instances in the database.</summary>
		public DataSource<UriComponentEntity> UriComponent
		{
			get { return new DataSource<UriComponentEntity>(_transactionToUse, new ElementCreator(), _customFunctionMappings, _contextToUse); }
		}
		
		#region Class Property Declarations
		/// <summary> Gets / sets the ITransaction to use for the queries created with this meta data object.</summary>
		/// <remarks> Be aware that the ITransaction object set via this property is kept alive by the LLBLGenProQuery objects created with this meta data
		/// till they go out of scope.</remarks>
		public ITransaction TransactionToUse
		{
			get { return _transactionToUse;}
			set { _transactionToUse = value;}
		}

		/// <summary>Gets or sets the custom function mappings to use. These take higher precedence than the ones in the DQE to use</summary>
		public FunctionMappingStore CustomFunctionMappings
		{
			get { return _customFunctionMappings; }
			set { _customFunctionMappings = value; }
		}
		
		/// <summary>Gets or sets the Context instance to use for entity fetches.</summary>
		public Context ContextToUse
		{
			get { return _contextToUse;}
			set { _contextToUse = value;}
		}
		#endregion
	}
}
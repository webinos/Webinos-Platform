///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:07
// Code is generated using templates: SD.TemplateBindings.SqlServerSpecific.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Data;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.HelperClasses
{
	/// <summary>
	/// Singleton implementation of the PersistenceInfoProvider. This class is the singleton wrapper through which the actual instance is retrieved.
	/// </summary>
	/// <remarks>It uses a single instance of an internal class. The access isn't marked with locks as the PersistenceInfoProviderBase class is threadsafe.</remarks>
	internal sealed class PersistenceInfoProviderSingleton
	{
		#region Class Member Declarations
		private static readonly IPersistenceInfoProvider _providerInstance = new PersistenceInfoProviderCore();
		#endregion
		
		/// <summary>private ctor to prevent instances of this class.</summary>
		private PersistenceInfoProviderSingleton()
		{
		}

		/// <summary>Dummy static constructor to make sure threadsafe initialization is performed.</summary>
		static PersistenceInfoProviderSingleton()
		{
		}

		/// <summary>Gets the singleton instance of the PersistenceInfoProviderCore</summary>
		/// <returns>Instance of the PersistenceInfoProvider.</returns>
		public static IPersistenceInfoProvider GetInstance()
		{
			return _providerInstance;
		}
	}

	/// <summary>Actual implementation of the PersistenceInfoProvider. Used by singleton wrapper.</summary>
	internal class PersistenceInfoProviderCore : PersistenceInfoProviderBase
	{
		/// <summary>Initializes a new instance of the <see cref="PersistenceInfoProviderCore"/> class.</summary>
		internal PersistenceInfoProviderCore()
		{
			Init();
		}

		/// <summary>Method which initializes the internal datastores with the structure of hierarchical types.</summary>
		private void Init()
		{
			base.InitClass((17 + 0));
			InitAttributeEntityMappings();
			InitAttributeTypeEntityMappings();
			InitAttributeValueEntityMappings();
			InitCombineModeEntityMappings();
			InitContextEntityMappings();
			InitDecisionNodeEntityMappings();
			InitEffectEntityMappings();
			InitLibraryEntityMappings();
			InitPolicyEntityMappings();
			InitPolicyDocumentEntityMappings();
			InitPolicyLinkEntityMappings();
			InitQueryEntityMappings();
			InitQueryValueEntityMappings();
			InitRuleEntityMappings();
			InitTargetEntityMappings();
			InitTargetConditionEntityMappings();
			InitUriComponentEntityMappings();

		}


		/// <summary>Inits AttributeEntity's mappings</summary>
		private void InitAttributeEntityMappings()
		{
			base.AddElementMapping( "AttributeEntity", "policyMar2010", @"dbo", "attribute", 4 );
			base.AddElementFieldMapping( "AttributeEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "AttributeEntity", "AttributeTypeId", "attributeTypeId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "AttributeEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 2 );
			base.AddElementFieldMapping( "AttributeEntity", "ContextId", "contextId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 3 );
		}
		/// <summary>Inits AttributeTypeEntity's mappings</summary>
		private void InitAttributeTypeEntityMappings()
		{
			base.AddElementMapping( "AttributeTypeEntity", "policyMar2010", @"dbo", "attributeType", 2 );
			base.AddElementFieldMapping( "AttributeTypeEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "AttributeTypeEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 50, 0, 0, false, "", null, typeof(System.String), 1 );
		}
		/// <summary>Inits AttributeValueEntity's mappings</summary>
		private void InitAttributeValueEntityMappings()
		{
			base.AddElementMapping( "AttributeValueEntity", "policyMar2010", @"dbo", "attributeValue", 6 );
			base.AddElementFieldMapping( "AttributeValueEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "AttributeValueEntity", "AttributeMatchId", "attributeMatchId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "AttributeValueEntity", "AttributeId", "attributeId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 2 );
			base.AddElementFieldMapping( "AttributeValueEntity", "Value", "value", true, (int)SqlDbType.NVarChar, 500, 0, 0, false, "", null, typeof(System.String), 3 );
			base.AddElementFieldMapping( "AttributeValueEntity", "Literal", "literal", false, (int)SqlDbType.Bit, 0, 0, 1, false, "", null, typeof(System.Boolean), 4 );
			base.AddElementFieldMapping( "AttributeValueEntity", "Order", "order", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 5 );
		}
		/// <summary>Inits CombineModeEntity's mappings</summary>
		private void InitCombineModeEntityMappings()
		{
			base.AddElementMapping( "CombineModeEntity", "policyMar2010", @"dbo", "combineMode", 2 );
			base.AddElementFieldMapping( "CombineModeEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "CombineModeEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 1 );
		}
		/// <summary>Inits ContextEntity's mappings</summary>
		private void InitContextEntityMappings()
		{
			base.AddElementMapping( "ContextEntity", "policyMar2010", @"dbo", "context", 2 );
			base.AddElementFieldMapping( "ContextEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "ContextEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 1 );
		}
		/// <summary>Inits DecisionNodeEntity's mappings</summary>
		private void InitDecisionNodeEntityMappings()
		{
			base.AddElementMapping( "DecisionNodeEntity", "policyMar2010", @"dbo", "decisionNode", 7 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "ParentId", "parentId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "Type", "type", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 2 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "CombineAnd", "combineAnd", false, (int)SqlDbType.Bit, 0, 0, 1, false, "", null, typeof(System.Boolean), 3 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "AttributeId", "attributeId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 4 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "Extra", "extra", true, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 5 );
			base.AddElementFieldMapping( "DecisionNodeEntity", "Order", "order", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 6 );
		}
		/// <summary>Inits EffectEntity's mappings</summary>
		private void InitEffectEntityMappings()
		{
			base.AddElementMapping( "EffectEntity", "policyMar2010", @"dbo", "effect", 2 );
			base.AddElementFieldMapping( "EffectEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "EffectEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 1 );
		}
		/// <summary>Inits LibraryEntity's mappings</summary>
		private void InitLibraryEntityMappings()
		{
			base.AddElementMapping( "LibraryEntity", "policyMar2010", @"dbo", "library", 3 );
			base.AddElementFieldMapping( "LibraryEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "LibraryEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 500, 0, 0, false, "", null, typeof(System.String), 1 );
			base.AddElementFieldMapping( "LibraryEntity", "Locked", "locked", false, (int)SqlDbType.Bit, 0, 0, 1, false, "", null, typeof(System.Boolean), 2 );
		}
		/// <summary>Inits PolicyEntity's mappings</summary>
		private void InitPolicyEntityMappings()
		{
			base.AddElementMapping( "PolicyEntity", "policyMar2010", @"dbo", "policy", 8 );
			base.AddElementFieldMapping( "PolicyEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "PolicyEntity", "LibraryId", "libraryId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "PolicyEntity", "Uid", "uid", false, (int)SqlDbType.UniqueIdentifier, 0, 0, 0, false, "", null, typeof(System.Guid), 2 );
			base.AddElementFieldMapping( "PolicyEntity", "Description", "description", false, (int)SqlDbType.NVarChar, 500, 0, 0, false, "", null, typeof(System.String), 3 );
			base.AddElementFieldMapping( "PolicyEntity", "TargetId", "targetId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 4 );
			base.AddElementFieldMapping( "PolicyEntity", "CombineModeId", "combineModeId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 5 );
			base.AddElementFieldMapping( "PolicyEntity", "Set", "set", false, (int)SqlDbType.Bit, 0, 0, 1, false, "", null, typeof(System.Boolean), 6 );
			base.AddElementFieldMapping( "PolicyEntity", "IsLibrary", "isLibrary", false, (int)SqlDbType.Bit, 0, 0, 1, false, "", null, typeof(System.Boolean), 7 );
		}
		/// <summary>Inits PolicyDocumentEntity's mappings</summary>
		private void InitPolicyDocumentEntityMappings()
		{
			base.AddElementMapping( "PolicyDocumentEntity", "policyMar2010", @"dbo", "policyDocument", 4 );
			base.AddElementFieldMapping( "PolicyDocumentEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "PolicyDocumentEntity", "LibraryId", "libraryId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "PolicyDocumentEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 2 );
			base.AddElementFieldMapping( "PolicyDocumentEntity", "PolicyLinkId", "policyLinkId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 3 );
		}
		/// <summary>Inits PolicyLinkEntity's mappings</summary>
		private void InitPolicyLinkEntityMappings()
		{
			base.AddElementMapping( "PolicyLinkEntity", "policyMar2010", @"dbo", "policyLink", 4 );
			base.AddElementFieldMapping( "PolicyLinkEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "PolicyLinkEntity", "PolicyId", "policyId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "PolicyLinkEntity", "ParentId", "parentId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 2 );
			base.AddElementFieldMapping( "PolicyLinkEntity", "Order", "order", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 3 );
		}
		/// <summary>Inits QueryEntity's mappings</summary>
		private void InitQueryEntityMappings()
		{
			base.AddElementMapping( "QueryEntity", "policyMar2010", @"dbo", "query", 3 );
			base.AddElementFieldMapping( "QueryEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "QueryEntity", "LibraryId", "libraryId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "QueryEntity", "Description", "description", false, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 2 );
		}
		/// <summary>Inits QueryValueEntity's mappings</summary>
		private void InitQueryValueEntityMappings()
		{
			base.AddElementMapping( "QueryValueEntity", "policyMar2010", @"dbo", "queryValue", 5 );
			base.AddElementFieldMapping( "QueryValueEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "QueryValueEntity", "QueryId", "queryId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "QueryValueEntity", "AttributeId", "attributeId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 2 );
			base.AddElementFieldMapping( "QueryValueEntity", "Extra", "extra", true, (int)SqlDbType.NVarChar, 250, 0, 0, false, "", null, typeof(System.String), 3 );
			base.AddElementFieldMapping( "QueryValueEntity", "Value", "value", false, (int)SqlDbType.NVarChar, 500, 0, 0, false, "", null, typeof(System.String), 4 );
		}
		/// <summary>Inits RuleEntity's mappings</summary>
		private void InitRuleEntityMappings()
		{
			base.AddElementMapping( "RuleEntity", "policyMar2010", @"dbo", "rule", 5 );
			base.AddElementFieldMapping( "RuleEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "RuleEntity", "PolicyId", "policyId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
			base.AddElementFieldMapping( "RuleEntity", "EffectId", "effectId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 2 );
			base.AddElementFieldMapping( "RuleEntity", "ConditionId", "conditionId", true, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 3 );
			base.AddElementFieldMapping( "RuleEntity", "Order", "order", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 4 );
		}
		/// <summary>Inits TargetEntity's mappings</summary>
		private void InitTargetEntityMappings()
		{
			base.AddElementMapping( "TargetEntity", "policyMar2010", @"dbo", "target", 2 );
			base.AddElementFieldMapping( "TargetEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "TargetEntity", "Description", "description", true, (int)SqlDbType.NVarChar, 50, 0, 0, false, "", null, typeof(System.String), 1 );
		}
		/// <summary>Inits TargetConditionEntity's mappings</summary>
		private void InitTargetConditionEntityMappings()
		{
			base.AddElementMapping( "TargetConditionEntity", "policyMar2010", @"dbo", "targetCondition", 2 );
			base.AddElementFieldMapping( "TargetConditionEntity", "TargetId", "targetId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "TargetConditionEntity", "ConditionId", "conditionId", false, (int)SqlDbType.Int, 0, 0, 10, false, "", null, typeof(System.Int32), 1 );
		}
		/// <summary>Inits UriComponentEntity's mappings</summary>
		private void InitUriComponentEntityMappings()
		{
			base.AddElementMapping( "UriComponentEntity", "policyMar2010", @"dbo", "uriComponent", 2 );
			base.AddElementFieldMapping( "UriComponentEntity", "Id", "id", false, (int)SqlDbType.Int, 0, 0, 10, true, "SCOPE_IDENTITY()", null, typeof(System.Int32), 0 );
			base.AddElementFieldMapping( "UriComponentEntity", "Name", "name", false, (int)SqlDbType.NVarChar, 50, 0, 0, false, "", null, typeof(System.String), 1 );
		}

	}
}